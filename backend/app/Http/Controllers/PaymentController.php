<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $bookingId = $request->booking_id;
        $booking = Booking::with('service')->find($bookingId);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $serviceName = $booking->service ? ($booking->service->service_name ?: $booking->service->name) : 'Salon Service';
        $amount = $booking->amount ?: ($booking->service ? $booking->service->price : 0);

        if ($amount <= 0) {
            return response()->json(['success' => false, 'message' => 'Invalid amount'], 400);
        }

        $stripeSecret = env('STRIPE_SECRET');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $stripeSecret,
            ])->withOptions([
                'verify' => false,
            ])->asForm()->post('https://api.stripe.com/v1/checkout/sessions', [
                'success_url' => 'http://localhost:3000/profile?payment_success=true&booking_id=' . $bookingId . '&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => 'http://localhost:3000/profile?payment_cancel=true',
                'mode' => 'payment',
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'pkr',
                            'product_data' => [
                                'name' => $serviceName,
                            ],
                            'unit_amount' => intval($amount * 100),
                        ],
                        'quantity' => 1,
                    ]
                ],
                'metadata' => [
                    'booking_id' => $bookingId,
                ]
            ]);

            if ($response->failed()) {
                Log::error('Stripe API error: ' . $response->body());
                return response()->json(['success' => false, 'message' => 'Stripe session creation failed: ' . ($response->json('error.message') ?? 'Unknown error')], 500);
            }

            $session = $response->json();
            return response()->json(['success' => true, 'url' => $session['url'], 'id' => $session['id']]);

        } catch (\Exception $e) {
            Log::error('Stripe Exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $bookingId = $request->booking_id;
        $sessionId = $request->session_id;

        if (!$bookingId || !$sessionId) {
            return response()->json(['success' => false, 'message' => 'Missing required fields'], 400);
        }

        $booking = Booking::with(['service', 'user'])->find($bookingId);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json(['success' => true, 'message' => 'Payment already confirmed']);
        }

        $stripeSecret = env('STRIPE_SECRET');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $stripeSecret,
            ])->withOptions([
                'verify' => false,
            ])->get('https://api.stripe.com/v1/checkout/sessions/' . $sessionId);

            if ($response->failed()) {
                Log::error('Stripe Session retrieval failed: ' . $response->body());
                return response()->json(['success' => false, 'message' => 'Failed to retrieve checkout session'], 500);
            }

            $session = $response->json();
            Log::info('Stripe Session: ' . json_encode($session));

            if ($session['payment_status'] === 'paid') {
                // Update booking status
                $booking->payment_status = 'paid';
                $booking->status = 'confirmed';
                $booking->payment_id = $sessionId;
                $booking->payment_method = 'card';
                $booking->save();

                $serviceName = $booking->service ? ($booking->service->service_name ?: $booking->service->name) : 'Salon Service';
                $amountFmt  = number_format($booking->amount);
                $clientName = $booking->customer_name ?: ($booking->user ? $booking->user->name : 'Client');

                try {
                    // In-app notification for the user
                    if ($booking->user_id) {
                        \App\Http\Controllers\NotificationController::createNotification(
                            $booking->user_id,
                            'Payment Successful!',
                            "Your payment of Rs. {$amountFmt} for {$serviceName} has been received. Booking ID: BK-{$booking->id}.",
                            'appointment'
                        );
                    }

                    // In-app notification for admin
                    // First check AdminUser table
                    $admin = \App\Models\AdminUser::where('is_active', 1)->first();
                    if (!$admin) {
                        // Fall back to checking User table with role='admin'
                        $admin = \App\Models\User::where('role', 'admin')->first();
                    }
                    
                    if ($admin) {
                        Log::info('Creating notification for admin user ID: ' . $admin->id);
                        if ($admin instanceof \App\Models\AdminUser) {
                            // Create notification with admin_id
                            \App\Models\Notification::create([
                                'admin_id' => $admin->id,
                                'title' => '💳 Payment Received',
                                'message' => "Rs. {$amountFmt} received from {$clientName} for {$serviceName} (BK-{$booking->id}).",
                                'type' => 'appointment'
                            ]);
                        } else {
                            // Create notification with user_id
                            \App\Http\Controllers\NotificationController::createNotification(
                                $admin->id,
                                '💳 Payment Received',
                                "Rs. {$amountFmt} received from {$clientName} for {$serviceName} (BK-{$booking->id}).",
                                'appointment'
                            );
                        }
                    } else {
                        Log::warning('No admin user found in either admin_users or users table');
                    }
                } catch (\Exception $notifyEx) {
                    Log::error('Notification creation failed: ' . $notifyEx->getMessage());
                    // Continue even if notifications fail
                }

                // Send email notification to user
                $email = $booking->customer_email ?: ($booking->user ? $booking->user->email : null);
                $name = $booking->customer_name ?: ($booking->user ? $booking->user->name : 'Valued Client');

                if ($email) {
                    try {
                        $bookingDate = $booking->booking_date;
                        $bookingTime = $booking->booking_time;
                        $amountPaid = $amountFmt;

                        $emailContent = "Dear {$name},\n\n"
                            . "Thank you for your payment! Your booking has been successfully paid and confirmed.\n\n"
                            . "Here are your booking details:\n"
                            . "---------------------------------\n"
                            . "Booking ID: BK-{$booking->id}\n"
                            . "Service: {$serviceName}\n"
                            . "Date: {$bookingDate}\n"
                            . "Time: {$bookingTime}\n"
                            . "Amount Paid: Rs. {$amountPaid}\n"
                            . "Payment Method: Stripe (Card)\n"
                            . "Payment ID: {$sessionId}\n"
                            . "---------------------------------\n\n"
                            . "We look forward to seeing you!\n\n"
                            . "Best regards,\n"
                            . "GlamConnect Team";

                        // Send email asynchronously to prevent blocking
                        if (!env('MAIL_HOST') || env('MAIL_HOST') === 'localhost') {
                            Log::info('Email notification (mail not configured): ' . $email);
                        } else {
                            \Illuminate\Support\Facades\Mail::raw($emailContent, function ($message) use ($email, $name) {
                                $message->to($email, $name)
                                        ->subject('GlamConnect - Payment Confirmation & Booking Details');
                            });
                        }
                    } catch (\Exception $mailEx) {
                        Log::error('Mail sending failed after payment: ' . $mailEx->getMessage());
                        // Don't fail the payment confirmation if email fails
                    }
                }

                return response()->json(['success' => true, 'message' => 'Payment confirmed successfully!']);
            } else {
                return response()->json(['success' => false, 'message' => 'Payment not completed yet'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Payment confirmation error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }
}

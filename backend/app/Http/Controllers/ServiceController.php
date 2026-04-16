<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function getServices()
    {
        $services = Service::all()->map(function($service) {
            return array_merge($service->toArray(), [
                'service_name' => $service->name,  // Alias for compatibility
                'image_url' => $service->image,     // Alias for compatibility
            ]);
        });
        return response()->json([
            'success' => true,
            'services' => $services
        ]);
    }

    public function createService(Request $request)
    {
        $data = $request->all();
        if (isset($data['service_name'])) {
            $data['name'] = $data['service_name'];
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/services'), $filename);
            $data['image'] = url('images/services/' . $filename);
        } elseif (isset($data['image_url'])) {
            $data['image'] = $data['image_url'];
        }

        $service = Service::create($data);
        return response()->json(['success' => true, 'service' => $service], 201);
    }

    public function updateService(Request $request)
    {
        $id = $request->id;
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['success' => false, 'message' => 'Service not found'], 404);
        }

        // Map frontend field names back to database column names
        $data = $request->all();
        if (isset($data['service_name'])) {
            $data['name'] = $data['service_name'];
            unset($data['service_name']);
        }
        
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/services'), $filename);
            $data['image'] = url('images/services/' . $filename);
        } elseif (isset($data['image_url'])) {
            $data['image'] = $data['image_url'];
            unset($data['image_url']);
        }

        // Handle 'icon' field which might come with emoji character
        if (isset($data['icon'])) {
            // Keep icon as is, it's a valid column now
        }

        $service->update($data);
        return response()->json(['success' => true, 'message' => 'Service updated']);
    }

    public function deleteService(Request $request)
    {
        $id = $request->id;
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['success' => false, 'message' => 'Service not found'], 404);
        }

        $service->delete();
        return response()->json(['success' => true, 'message' => 'Service deleted']);
    }
}

package com.example.money.controller;

import com.example.money.service.FcmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fcm")
@CrossOrigin(origins = "*") // Adjust this for production
public class FcmController {

    @Autowired
    private FcmService fcmService;

    @PostMapping("/send")
    public Map<String, String> sendNotification(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String title = payload.get("title");
        String body = payload.get("body");

        String response;
        if (token != null && !token.isEmpty()) {
            response = fcmService.sendNotification(token, title, body);
        } else {
            response = fcmService.sendBroadcast(title, body);
        }

        return Map.of("result", response);
    }
}

package org.bhagya.notificationservice.service;

import org.bhagya.notificationservice.dto.NotificationRequest;
import org.bhagya.notificationservice.dto.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class NotificationService {

    @Autowired(required = false)  // If email config is not provided, this may be null.
    private JavaMailSender mailSender;

    /**
     * Sends a notification using the specified channel.
     * For now, we implement email channel using JavaMailSender.
     * Other channels (sms, push) are simulated with logging.
     */
    public NotificationResponse sendNotification(NotificationRequest request) {
        String channel = request.getChannel().toLowerCase();
        if ("email".equals(channel)) {
            return sendEmailNotification(request);
        } else {
            // Simulate other channels (for example, SMS or push notifications)
            System.out.println("Simulated " + channel + " notification to " + request.getRecipient() +
                    " : " + request.getMessage());
            return new NotificationResponse("SUCCESS", "Notification sent via " + channel + " (simulated)");
        }
    }

    private NotificationResponse sendEmailNotification(NotificationRequest request) {
        if(mailSender == null) {
            return new NotificationResponse("ERROR", "MailSender is not configured");
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(request.getRecipient());
            helper.setSubject(request.getSubject());
            helper.setText(request.getMessage(), true);
            mailSender.send(message);
            return new NotificationResponse("SUCCESS", "Email sent successfully");
        } catch (MailException | MessagingException ex) {
            ex.printStackTrace();
            return new NotificationResponse("ERROR", "Failed to send email: " + ex.getMessage());
        }
    }
}

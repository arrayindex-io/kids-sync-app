package com.arrayindex.kids_sync_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Enable scheduled tasks like reminders
public class KidsyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(KidsyncApplication.class, args);
	}

} 
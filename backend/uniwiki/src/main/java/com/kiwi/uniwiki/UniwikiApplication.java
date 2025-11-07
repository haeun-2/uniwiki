package com.kiwi.uniwiki;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class UniwikiApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniwikiApplication.class, args);
	}

}

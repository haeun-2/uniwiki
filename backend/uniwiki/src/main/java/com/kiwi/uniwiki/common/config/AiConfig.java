package com.kiwi.uniwiki.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder clientBuilder) {
        return clientBuilder.build();
    }

    @Bean
    public RestClientCustomizer restClientLogger() {
        return builder -> builder.requestInterceptor((request, body, execution) -> {
            log.debug("[{}] {}", request.getMethod(), request.getURI());
            var response = execution.execute(request, body);
            log.debug("[{}] {}", response.getStatusCode(), response.getStatusText());
            return response;
        });
    }

}

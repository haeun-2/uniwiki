package com.kiwi.uniwiki.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        // JWT 인증 스키마 정의
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .name("Authorization")
                .description("JWT 토큰을 입력하세요. (Bearer 생략)");

        // 해당 스키마를 전체 API 전역에 적용
        SecurityRequirement securityRequirement = new SecurityRequirement().addList("JWT");

        // 서버 URL 설정
        Server httpsServer = new Server()

                .url("https://k13d104.p.ssafy.io")

                .description("HTTPS 서버");

        Server httpServer = new Server()
                .url("http://localhost:8080")
                .description("로컬 개발 서버");

        return new OpenAPI()
                .info(new Info()
                        .title("API 문서")
                        .description("Spring Boot REST API 문서")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("개발자")
                                .email("developer@example.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(httpsServer, httpServer))  // 서버 목록 추가
                .addSecurityItem(securityRequirement)
                .components(new Components().addSecuritySchemes("JWT", securityScheme));
    }
}
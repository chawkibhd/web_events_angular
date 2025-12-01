package com.projet.eventsservice;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // API stateless : on désactive CSRF pour tout (sinon POST vers /api/notifications renvoie 403)
            .csrf(csrf -> csrf.disable())

            // On autorise TOUT pour simplifier (tu remettras des règles plus tard si besoin)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().permitAll()
            )

            // H2 utilise des iframes → il faut les autoriser
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}

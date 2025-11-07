package com.kiwi.uniwiki.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwi.uniwiki.domain.user.entity.UserBan;
import com.kiwi.uniwiki.domain.user.repository.UserBanRepository;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import com.kiwi.uniwiki.security.service.CustomUserDetailsService;
import com.kiwi.uniwiki.security.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserBanRepository userBanRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {

            String email = jwtTokenProvider.getUsername(token);


            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            Integer userId = null;
            if (userDetails instanceof CustomUserDetails) {
                userId = ((CustomUserDetails) userDetails).getUser().getId();
            }

            // 차단 유저의 경우 GET 요청을 제외한 모든 요청 이용 불가
            if (!"GET".equalsIgnoreCase(request.getMethod())) {
                if (userId != null && userBanRepository.existsActiveBanByUserId(userId, LocalDateTime.now())) {
                    sendBanResponse(response, userId);
                    return;
                }
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,  // ← CustomUserDetails 객체
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private void sendBanResponse(HttpServletResponse response, Integer userId) throws IOException {
        // Repository를 직접 사용하는 경우
        UserBan ban = userBanRepository.findActiveBanByUserId(userId, LocalDateTime.now())
                .orElse(null);

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "USER_BANNED");
        errorResponse.put("message", "계정이 차단되었습니다.");

        if (ban != null) {
            errorResponse.put("reason", ban.getReason());
            errorResponse.put("bannedUntil", ban.getBannedUntil().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    /**
     * Request Header에서 JWT 토큰 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
package com.kiwi.uniwiki.domain.admin.service;

import com.kiwi.uniwiki.common.exception.CustomException;
import com.kiwi.uniwiki.common.exception.ErrorCode;
import com.kiwi.uniwiki.domain.admin.dto.request.AdminRequestDTO;
import com.kiwi.uniwiki.domain.code.service.CodeService;
import com.kiwi.uniwiki.domain.report.entity.UserReport;
import com.kiwi.uniwiki.domain.report.repository.UserReportRepository;
import com.kiwi.uniwiki.domain.user.entity.User;
import com.kiwi.uniwiki.domain.user.entity.UserBan;
import com.kiwi.uniwiki.domain.user.repository.UserBanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cglib.core.Local;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminWriteService {

    private final UserReportRepository userReportRepository;
    private final CodeService codeService;
    private final UserBanRepository userBanRepository;
    private static final String BAN_KEY_PREFIX="user:ban:";
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional
    public void rejectUserReport(User admin, Integer reportId, AdminRequestDTO.ReportRejectedRequest request){


        UserReport userReport = userReportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));
        //이미 신고 처리가 됬다면
        if(userReport.getCode().getId() != codeService.get("USER_REPORT_STATUS","PENDING").getId()){
            throw new CustomException(ErrorCode.REPORT_ALREADY_PROCESSED);
        }

        userReport.reportProcess(admin, request.getReason(), codeService.get("USER_REPORT_STATUS","REJECTED"));

    }

    @Transactional
    public void resolvedReport(User admin, Integer reportId, AdminRequestDTO.ReportSolvedRequest request){


        UserReport userReport = userReportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));

        //이미 신고 처리가 됬다면
        if(userReport.getCode().getId() != codeService.get("USER_REPORT_STATUS","PENDING").getId()){
            throw new CustomException(ErrorCode.REPORT_ALREADY_PROCESSED);
        }

        UserBan userBan = UserBan.builder()
                .user(userReport.getReportedUser())
                .admin(admin)
                .userReport(userReport)
                .reason(request.getReason())
                .bannedUntil(request.getBanUntil())
                .build();

        userBanRepository.save(userBan);


        userReport.reportProcess(admin, request.getReason(), codeService.get("USER_REPORT_STATUS","RESOLVED"));

    }

}

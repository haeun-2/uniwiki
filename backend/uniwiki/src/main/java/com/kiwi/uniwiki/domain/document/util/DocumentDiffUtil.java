package com.kiwi.uniwiki.domain.document.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.difflib.DiffUtils;
import com.github.difflib.patch.AbstractDelta;
import com.github.difflib.patch.DeltaType;
import com.github.difflib.patch.Patch;
import com.kiwi.uniwiki.domain.document.dto.DiffDTO.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentDiffUtil {

    private final ObjectMapper objectMapper;

    /**
     * 내용 비교 결과 반환
     */
    public DiffInfoDTO getDiffs(String oldContent, String newContent) {

        if (oldContent == null) oldContent = "";
        if (newContent == null) newContent = "";

        // 버전 비교
        List<DiffLineDTO> diffLines = compareContents(oldContent, newContent);

        // 버전 비교 내용 데이터화
        String diffJson;
        try {
            diffJson = objectMapper.writeValueAsString(diffLines);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize diff", e);
        }

        long plusCount = diffLines.stream()
                .filter(d -> d.type.equals("INSERT") || d.type.equals("CHANGE_NEW"))
                .count();

        long minusCount = diffLines.stream()
                .filter(d -> d.type.equals("DELETE") || d.type.equals("CHANGE_OLD"))
                .count();

        return DiffInfoDTO.builder()
                .diffs(diffJson)
                .plusCount((int) plusCount)
                .minusCount((int) minusCount)
                .build();
    }

    /**
     * 버전 별 내용 비교
     */
    private List<DiffLineDTO> compareContents(String oldContent, String newContent) {
        List<String> oldLines = oldContent.isEmpty() ? new ArrayList<>() : Arrays.asList(oldContent.split("\n"));
        List<String> newLines = newContent.isEmpty() ? new ArrayList<>() : Arrays.asList(newContent.split("\n"));

        Patch<String> patch = DiffUtils.diff(oldLines, newLines);
        List<DiffLineDTO> result = new ArrayList<>();

        for (AbstractDelta<String> delta : patch.getDeltas()) {
            DeltaType type = delta.getType();

            int oldPos = delta.getSource().getPosition();
            int newPos = delta.getTarget().getPosition();

            switch (type) {
                case DELETE -> {
                    int lineNum = oldPos + 1; // 1-based로 표시
                    for (String line : delta.getSource().getLines()) {
                        result.add(new DiffLineDTO(lineNum++, line, "DELETE"));
                    }
                }
                case INSERT -> {
                    int lineNum = newPos + 1;
                    for (String line : delta.getTarget().getLines()) {
                        result.add(new DiffLineDTO(lineNum++, line, "INSERT"));
                    }
                }
                case CHANGE -> {
                    int delLine = oldPos + 1;
                    for (String line : delta.getSource().getLines()) {
                        result.add(new DiffLineDTO(delLine++, line, "CHANGE_OLD"));
                    }

                    int addLine = newPos + 1;
                    for (String line : delta.getTarget().getLines()) {
                        result.add(new DiffLineDTO(addLine++, line, "CHANGE_NEW"));
                    }
                }
            }
        }

        return result;
    }
}

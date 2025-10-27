package com.kiwi.uniwiki.test;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.AbstractDelta;
import com.github.difflib.patch.DeltaType;
import com.github.difflib.patch.Patch;
import com.kiwi.uniwiki.security.dto.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class TestController {

    @GetMapping("/test/diff")
    public String getDiff() {
        // 이전 문서 내용 (String)
        String originalDoc = "첫 번째 줄\n두 번째 줄\n세 번째 줄\n네 번째 줄";

        // 새로운 문서 내용 (String)
        String revisedDoc = "첫 번째 줄\n수정된 두 번째 줄\n세 번째 줄\n추가된 다섯 번째 줄";

        // HTML 생성
        String html = generateColoredDiffHtml(originalDoc, revisedDoc);

        return html;
    }

    private String generateColoredDiffHtml(String originalDoc, String revisedDoc) {
        // String을 줄 단위 List로 변환
        List<String> original = Arrays.asList(originalDoc.split("\n"));
        List<String> revised = Arrays.asList(revisedDoc.split("\n"));

        Patch<String> patch = DiffUtils.diff(original, revised);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>")
                .append("<html>")
                .append("<head>")
                .append("<meta charset='UTF-8'>")
                .append("<style>")
                .append("body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; }")
                .append(".line { padding: 5px 10px; margin: 2px 0; border-radius: 3px; }")
                .append(".unchanged { background-color: #ffffff; }")
                .append(".deleted { background-color: #ffcccc; text-decoration: line-through; color: #cc0000; }")
                .append(".inserted { background-color: #ccffcc; color: #006600; }")
                .append(".changed-old { background-color: #ffddaa; text-decoration: line-through; color: #cc6600; }")
                .append(".changed-new { background-color: #aaddff; color: #0066cc; }")
                .append(".label { font-weight: bold; display: inline-block; width: 80px; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<h2>문서 비교 결과</h2>");

        int originalIndex = 0;
        int revisedIndex = 0;

        for (AbstractDelta<String> delta : patch.getDeltas()) {
            // 변경 전까지의 동일한 부분 출력
            while (originalIndex < delta.getSource().getPosition()) {
                html.append("<div class='line unchanged'>")
                        .append(escapeHtml(original.get(originalIndex)))
                        .append("</div>");
                originalIndex++;
                revisedIndex++;
            }

            // 변경 타입에 따른 처리
            if (delta.getType() == DeltaType.DELETE) {
                // 삭제된 부분 (빨간색)
                for (String line : delta.getSource().getLines()) {
                    html.append("<div class='line deleted'>")
                            .append("<span class='label'>[삭제됨]</span>")
                            .append(escapeHtml(line))
                            .append("</div>");
                    originalIndex++;
                }
            } else if (delta.getType() == DeltaType.INSERT) {
                // 추가된 부분 (초록색)
                for (String line : delta.getTarget().getLines()) {
                    html.append("<div class='line inserted'>")
                            .append("<span class='label'>[추가됨]</span>")
                            .append(escapeHtml(line))
                            .append("</div>");
                    revisedIndex++;
                }
            } else if (delta.getType() == DeltaType.CHANGE) {
                // 변경된 부분 (주황색 -> 파란색)
                for (String line : delta.getSource().getLines()) {
                    html.append("<div class='line changed-old'>")
                            .append("<span class='label'>[변경 전]</span>")
                            .append(escapeHtml(line))
                            .append("</div>");
                    originalIndex++;
                }
                for (String line : delta.getTarget().getLines()) {
                    html.append("<div class='line changed-new'>")
                            .append("<span class='label'>[변경 후]</span>")
                            .append(escapeHtml(line))
                            .append("</div>");
                    revisedIndex++;
                }
            }
        }

        // 나머지 동일한 부분 출력
        while (originalIndex < original.size()) {
            html.append("<div class='line unchanged'>")
                    .append(escapeHtml(original.get(originalIndex)))
                    .append("</div>");
            originalIndex++;
        }

        html.append("</body></html>");
        return html.toString();
    }

    // HTML 특수문자 이스케이프 처리
    private String escapeHtml(String text) {
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(userDetails.getUsername());
    }

}
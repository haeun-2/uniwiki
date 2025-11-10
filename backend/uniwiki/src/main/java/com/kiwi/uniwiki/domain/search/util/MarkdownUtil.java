package com.kiwi.uniwiki.domain.search.util;

import org.commonmark.Extension;
import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.text.TextContentRenderer;

import java.util.List;

public class MarkdownUtil {

    public static String removeMarkdown(String markdown) {
        if (markdown == null || markdown.isEmpty()) {
            return "";
        }

        // GFM 확장 기능 추가 (표, 취소선 등)
        List<Extension> extensions = List.of(
                TablesExtension.create(),
                StrikethroughExtension.create()
        );

        // Parser에 확장 기능 적용
        Parser parser = Parser.builder()
                .extensions(extensions)
                .build();
        Node document = parser.parse(markdown);

        // TextContentRenderer에도 확장 기능 적용
        TextContentRenderer renderer = TextContentRenderer.builder()
                .extensions(extensions)
                .build();

        return renderer.render(document).trim();
    }

}

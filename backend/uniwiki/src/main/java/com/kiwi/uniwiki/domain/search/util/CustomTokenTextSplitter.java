package com.kiwi.uniwiki.domain.search.util;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@NoArgsConstructor
@AllArgsConstructor
public class CustomTokenTextSplitter extends TokenTextSplitter {

    private int overlapTokens = 80;

    @Override
    public List<Document> split(Document document) {
        List<Document> chunks = super.split(document);
        return addOverlap(chunks);
    }

    private List<Document> addOverlap(List<Document> chunks) {
        if (chunks.size() <= 1) return chunks;

        List<Document> overlappedChunks = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            String content = chunks.get(i).getText();

            // 이전 청크의 끝부분 추가
            if (i > 0) {
                String prevContent = chunks.get(i - 1).getText();
                String overlap = getLastNTokens(prevContent, overlapTokens);
                content = overlap + " " + content;
            }

            overlappedChunks.add(new Document(content, chunks.get(i).getMetadata()));
        }

        return overlappedChunks;
    }

    private String getLastNTokens(String text, int n) {
        String[] words = text.split("\\s+");
        int start = Math.max(0, words.length - n);
        return String.join(" ", Arrays.copyOfRange(words, start, words.length));
    }

}

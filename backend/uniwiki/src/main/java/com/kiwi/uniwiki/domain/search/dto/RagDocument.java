package com.kiwi.uniwiki.domain.search.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RagDocument {

    private Integer documentId;
    private String text;
    private Double score;

}

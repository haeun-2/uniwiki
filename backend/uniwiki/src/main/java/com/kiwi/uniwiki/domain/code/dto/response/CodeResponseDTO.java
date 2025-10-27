package com.kiwi.uniwiki.domain.code.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class CodeResponseDTO {

    private Map<String, List<String>> codes;

}

package com.kiwi.uniwiki.domain.code.service;

import com.kiwi.uniwiki.domain.code.dto.response.CodeResponseDTO;
import com.kiwi.uniwiki.domain.code.entity.Code;
import com.kiwi.uniwiki.domain.code.repository.CodeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeService {

    private final CodeRepository codeRepository;
    private final Map<String, Code> codeMap = new HashMap<>();

    @PostConstruct
    public void init() {
        codeRepository.findAllWithCodeGroup().forEach(code ->
                codeMap.put(code.getCodeGroup().getName() + ":" + code.getName(), code));
    }

    public CodeResponseDTO getAllCodes() {
        Map<String, List<String>> map = codeMap.entrySet().stream()
                .collect(Collectors.groupingBy(
                        e -> e.getKey().split(":")[0],
                        Collectors.mapping(e -> e.getKey().split(":")[1], Collectors.toList())
                ));

        return new CodeResponseDTO(map);
    }

    public Code get(String group, String name) {
        return codeMap.get(group + ":" + name);
    }
}

package com.kiwi.uniwiki.domain.document.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DocumentCreatedEvent {

    Integer documentId;

}

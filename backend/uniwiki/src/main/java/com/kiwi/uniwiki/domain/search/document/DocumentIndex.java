package com.kiwi.uniwiki.domain.search.document;

import com.kiwi.uniwiki.domain.document.entity.Document;
import com.kiwi.uniwiki.domain.document.entity.DocumentVersion;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Mapping;
import org.springframework.data.elasticsearch.annotations.Setting;

@org.springframework.data.elasticsearch.annotations.Document(indexName = "document_index")
@Getter
@Setting(settingPath = "elasticsearch/document-setting.json")
@Mapping(mappingPath = "elasticsearch/document-mapping.json")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DocumentIndex {

    @Id
    @Field(type = FieldType.Integer)
    private Integer id;

    @Field(type= FieldType.Text)
    private String title;

    @Field(type= FieldType.Text)
    private String content;

    @Field(type = FieldType.Short)
    private Short universityId;

    @Field(type = FieldType.Short)
    private Short categoryId;

    @Field(type = FieldType.Keyword)
    private String universityName;

    @Field(type = FieldType.Keyword)
    private String categoryName;

    public static DocumentIndex from(Document document, DocumentVersion documentVersion) {
        return DocumentIndex.builder()
                .id(document.getId())
                .title(document.getTitle())
                .content(documentVersion.getContent())
                .universityId(document.getUniversity().getId())
                .categoryId(document.getCategory().getId())
                .universityName(document.getUniversity().getName())
                .categoryName(document.getCategory().getName())
                .build();
    }

}

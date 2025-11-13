package com.kiwi.uniwiki.domain.search.document;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

@Document(indexName = "university-index")
@Getter
@Setting(settingPath = "elasticsearch/university-setting.json")
@Mapping(mappingPath = "elasticsearch/university-mapping.json")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UniversityIndex {

    @Id
    @Field(type = FieldType.Integer)
    private Short id;

    @Field(type = FieldType.Text)
    private String name;

    @Field(type = FieldType.Keyword)
    private String logoUrl;

}

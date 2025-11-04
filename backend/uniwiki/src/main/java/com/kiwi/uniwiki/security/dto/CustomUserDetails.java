package com.kiwi.uniwiki.security.dto;
import com.kiwi.uniwiki.domain.user.entity.User;
import lombok.Getter;
;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;


import lombok.Builder;

import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CustomUserDetails implements UserDetails{


    private User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = user.getRole().toString();
        if(role.startsWith("ROLE_")){
            return List.of(new SimpleGrantedAuthority(role));
        }else{
            return List.of(new SimpleGrantedAuthority("ROLE_"+role));
        }

    }

    @Override
    public String getPassword() {


        return user.getPassword();
    }

    @Override
    public String getUsername() { return user.getEmail(); }


}



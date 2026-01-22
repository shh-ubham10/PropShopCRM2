package com.propshop.crm

import android.R

data class LoginResponse(
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: String,
    val role: String
)


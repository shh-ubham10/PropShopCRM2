package com.propshop.crm

data class RegisterPayload(
    val username: String,
    val password: String,
    val phone_number: String, // ✅ NEW
    val role: String
)

data class RegisterResponse(
    val token: String,
    val user: RegisterUser
)

data class RegisterUser(
    val id: String,
    val username: String,
    val role: String
)

package com.propshop.crm

data class LoginRequest(
    val identifier: String, // username OR mobile
    val password: String
)


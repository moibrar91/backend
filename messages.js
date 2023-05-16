module.exports = (lang = 'en') => {
    const incorrect_cc = {
        "en": "Incorrect country code selected!"
    }

    const otp_sent = {
        "en": "OTP sent on given number",
        "hi": "दिए गए नंबर पर ओटीपी भेजा गया है"
    }

    const otp_resent = {
        "en": "OTP sent back to the given number"
    }

    const otp_sent_email = {
        "en": "OTP sent to the given email"
    }

    const otp_resent_email = {
        "en": "OTP sent back to the given email"
    }

    const otp_sent_on_both = {
        "en": "OTP sent on both mobile and email"
    }


    const incorrect_otp = {
        "en": "Entered OTP is incorrect!"
    }

    const otp_not_verified = {
        "en": "OTP is not verified!"
    }

    const otp_verified = {
        "en": "OTP verified successfully!"
    }

    const exists = function(name) {
        return {
            "en": `Please try with registered ${name} as this ${name} is not registered with us.`
        }
    }

    const unique = function(name) {
        return {
            "en": `${name} is already taken!`
        }
    }

    const maxLength = function(name) {
        return {
            "en": `${name} exceeded the character limit!`
        }
    }

    const required = function(name) {
        return {
            "en": `${name} is required!`
        }
    }

    const invalid_token = {
        "en": "Invalid token!"
    }


    const ac_deactivated = {
        "en": "Your account is deactivated by admin!"
    }

    const unauthorized = {
        "en": "You do not have permission to make changes."
    }


    const user_logout = {
        "en": "User logout successfully!"
    }

    const user_list = {
        "en": "User list"
    }
    const user_details = {
        "en": "User details"
    }
    const user_added = {
        "en": "User added successfully"
    }
    const user_updated = {
        "en": "User updated successfully"
    }
    const user_status_changed = {
        "en": "User status updated successfully"
    }
    const user_removed = {
        "en": "User removed successfully"
    }
    const mobile_not_found = {
        "en": `No record found with given details!`
    }

    const profile_updated = {
        "en": `profile updated successfully`
    }

    const mobile_updated = {
        "en": `Mobile updated successfully`
    }

    const email_updated = {
        "en": `Email updated successfully`
    }

    const profile_details = {
        "en": `Profile details`
    }

    const mobile_exist = {
      "en": "Entered mobile number already registered, Please change and try again!"
    }

    const profile_not_complete = {
      "en": "Your profile is not complete, Please complete your profile and try again!"
    }

    const email_exist = {
      "en": "Email already taken, Please change and try again!"
    }

    const username_exist = {
      "en": "Username already taken, Please change and try again!"
    }
    const wrong_email = {
        "en": "Please try with Registered Email as this email is not registered with us"
    }
    const incorrect_password = {
        "en": "Entered password is incorrect!",
    }
    const password_changed = {
      "en": "Password updated successfully. Please login with new password!",
    }
    const incorrect_current_password = {
        "en": "Entered current password is incorrect!",
    }
    const about_changed = {
        "en": "About us updated!",
    }
    const about_us = {
        "en": "about_us",
    }
    const privacy_policy_changed = {
        "en": "Privacy and policy updated!",
    }
    const privacy_policy = {
        "en": "Privacy and policy",
    }
    const term_and_conditions_changed = {
        "en": "Term and condition updated!",
    }
    const term_and_condition = {
        "en": "Term and condition",
    }

    const status_changed = {
        "en": "Status updated successfully"
    }
    const invalid_user_type = {
        "en": "Invalid user_type selected!"
    }
    const year_list = {
        "en": "Year list"
    }

    const comment_added = {
        "en": "Comment added successfully"
    }

    const comment_updated = {
        "en": "Comment updated successfully"
    }

    const mobile_not_verified = {
        "en": "Mobile is not not verified, otp sent on given number please verify your mobile."
    }

    const email_not_verified = {
        "en": "Email is not not verified, otp sent on given email please verify your email."
    }

    const abusive_word_exist = {
        "en": "Abusive words are not allowed."
    }
    const meeting_not_exist = {
        "en": "Please try again, there is no meeting available on this url."
    }
    const meeting_start_soon = {
        "en": "Please try again, there is no meeting available right now."
    }



    return {
        unauthorized: unauthorized[lang],
        ac_deactivated: ac_deactivated[lang],
        invalid_token: invalid_token[lang],
        incorrect_cc: incorrect_cc[lang],
        otp_sent: otp_sent[lang],
        otp_sent_on_both:otp_sent_on_both[lang],
        otp_resent: otp_resent[lang],
        incorrect_otp: incorrect_otp[lang],
        otp_verified: otp_verified[lang],
        otp_not_verified: otp_not_verified[lang],
        exists,
        unique,
        required,
        maxLength,
        //user_details:user_details[lang],
        user_logout:user_logout[lang],
        user_list:user_list[lang],
        user_details:user_details[lang],
        user_added:user_added[lang],
        user_updated:user_updated[lang],
        user_status_changed:user_status_changed[lang],
        user_removed:user_removed[lang],
        mobile_not_found:mobile_not_found[lang],
        profile_updated:profile_updated[lang],
        mobile_updated:mobile_updated[lang],
        email_updated:email_updated[lang],
        profile_details:profile_details[lang],
        mobile_exist:mobile_exist[lang],
        email_exist:email_exist[lang],
        username_exist:username_exist[lang],
        wrong_email:wrong_email[lang],
        incorrect_password: incorrect_password[lang],
        password_changed: password_changed[lang],
        incorrect_current_password:incorrect_current_password[lang],
        about_changed:about_changed[lang],
        about_us:about_us[lang],
        otp_sent_email:otp_sent_email[lang],
        otp_resent_email:otp_resent_email[lang],
        privacy_policy_changed:privacy_policy_changed[lang],
        privacy_policy:privacy_policy[lang],
        term_and_conditions_changed:term_and_conditions_changed[lang],
        term_and_condition:term_and_condition[lang],
        status_changed:status_changed[lang],
        invalid_user_type:invalid_user_type[lang],
        year_list:year_list[lang],
        profile_not_complete:profile_not_complete[lang],
        comment_added:comment_added[lang],
        comment_updated:comment_updated[lang],
        mobile_not_verified:mobile_not_verified[lang],
        email_not_verified:email_not_verified[lang],
        abusive_word_exist:abusive_word_exist[lang],
        meeting_not_exist:meeting_not_exist[lang],
        meeting_start_soon:meeting_start_soon[lang],

    }
}

package org.vechain.veworld.app.googleDrive.domain

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonParseException
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import expo.modules.core.utilities.ifNull
import org.vechain.veworld.app.googleDrive.util.DataError
import org.vechain.veworld.app.googleDrive.util.Result
import java.lang.reflect.Type

enum class DerivationPath(val value: String) {
    ETH("m/44'/60'/0'/0"),
    VET("m/44'/818'/0'/0");

    companion object {
        fun fromType(path: String): Result<DerivationPath, DataError.Device> {
            val result = DerivationPath.entries.find { it.value == path }

            if (result == null) {
                return Result.Error(DataError.Device.UNKNOWN_DERIVATION_PATH)
            }

            return Result.Success(result)
        }
    }
}

class DerivationPathDeserializer  : JsonDeserializer<DerivationPath> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): DerivationPath {
        val type = json.asString
        return when(val result = DerivationPath.fromType(type)) {
            is Result.Success -> result.data
            is Result.Error -> throw JsonParseException("Error parsing DeviceType")
        }
    }
}

class DerivationPathSerializer : JsonSerializer<DerivationPath> {
    override fun serialize(
        src: DerivationPath,
        typeOfSrc: Type,
        context: JsonSerializationContext
    ): JsonElement {
        return JsonPrimitive(src.value)
    }
}
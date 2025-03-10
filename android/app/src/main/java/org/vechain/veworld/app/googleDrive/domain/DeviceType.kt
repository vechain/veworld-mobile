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

enum class DeviceType(val value: String) {
    LOCAL_MNEMONIC("local-mnemonic"),
    LOCAL_WATCHED("local-watched"),
    LOCAL_PRIVATE_KEY("local-pk"),
    LEDGER("ledger");

    companion object {
        fun fromType(type: String): Result<DeviceType, DataError.Device> {
            val result = entries.find { it.value == type }

            if (result == null) {
                return Result.Error(DataError.Device.UNKNOWN_TYPE)
            }

            return Result.Success(result)
        }
    }
}

class DeviceTypeDeserializer : JsonDeserializer<DeviceType> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): DeviceType {
        val type = json.asString
        return when(val result = DeviceType.fromType(type)) {
            is Result.Success -> result.data
            is Result.Error -> throw JsonParseException("Error parsing DeviceType")
        }
    }
}

class DeviceTypeSerializer  : JsonSerializer<DeviceType> {
    override fun serialize(
        src: DeviceType,
        typeOfSrc: Type,
        context: JsonSerializationContext
    ): JsonElement {
        return JsonPrimitive(src.value)
    }
}
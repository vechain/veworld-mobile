package org.vechain.veworld.app.googleDrive.domain

import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import java.lang.reflect.Type

data class Iv(
    val value: String
) {
    fun toWritableMap(): WritableMap {
        return WritableNativeMap().apply {
            putString("iv", value)
        }
    }
}

class IVDeserializer: JsonDeserializer<Iv> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): Iv {
        return Iv(json.asString) // Wrap the string in Iv
    }
}

class IVSerializer: JsonSerializer<Iv> {
    override fun serialize(
        src: Iv,
        typeOfSrc: Type,
        context: JsonSerializationContext
    ): JsonElement {
        return JsonPrimitive(src.value)
    }
}

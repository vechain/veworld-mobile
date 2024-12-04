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

data class Salt(
    val value: String
) {
    fun toWritableMap(): WritableMap {
        return WritableNativeMap().apply {
            putString("salt", value)
        }
    }
}

class SaltDeserializer: JsonDeserializer<Salt> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): Salt {
        return Salt(json.asString) // Wrap the string in Iv
    }
}

class SaltSerializer: JsonSerializer<Salt> {
    override fun serialize(
        src: Salt,
        typeOfSrc: Type,
        context: JsonSerializationContext
    ): JsonElement {
        return JsonPrimitive(src.value)
    }
}

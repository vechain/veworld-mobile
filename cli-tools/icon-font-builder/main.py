from typing import Literal
import fontforge
import argparse
import json
import os
import collections
import shutil

CACHE_DIR = "./svg_cache"

def generate_map_file(map_data: dict[str, int], output_dir: str):
    items = [f"    \"{key}\": {value}" for key, value in collections.OrderedDict(sorted(map_data.items())).items()]
    if items:
        items[-1] = items[-1] + ","
    content = "export const designSystemIconMap = {\n%s\n}" % ",\n".join(items)
    with open(f"{output_dir}/designSystemIconMap.ts", "w") as f:
        f.write(content)
        f.close()

def build_font(font_name: str, font_map: str, font_prefix: str, output_dir: str):
    font_map: dict[Literal["icons", "sets", "groups"], list[dict]] = json.load(open(font_map))

    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR, mode=0o777)

    font = fontforge.font()
    font.familyname = font_name
    font.fontname = font_name
    font.fullname = font_name
    font.copyright = "VeChain Foundation 2025"
    font.encoding = "UnicodeFull"
    font.em=256

    map_data = {}

    for icon in font_map["icons"]:
        with open(f"{CACHE_DIR}/{icon['name']}.svg", "w") as f:
            f.write(icon["content"])
            f.close()

        map_data[font_prefix + icon["name"]] = icon["code"]

        glyph = font.createChar(icon["code"], icon["name"])
        glyph.importOutlines(f"{CACHE_DIR}/{icon['name']}.svg", simplify=False, accuracy=0.5)
    
    temp_ttf_path = f"./{font_name}.ttf"
    font.generate(temp_ttf_path, flags=["glyph-map-file"])
    
    output_ttf_path = f"{output_dir}/{font_name}.ttf"
    os.makedirs(output_dir, exist_ok=True)
    shutil.move(temp_ttf_path, output_ttf_path)
    
    generate_map_file(map_data, output_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="icon-font-builder")
    parser.add_argument("--font-map", type=str, required=False, default="./DesignSystemIcons.json", help="Path to the font map JSON file")
    parser.add_argument("--font-name", type=str, required=False, default="DesignSystemIcons", help="Name of the font")
    parser.add_argument("--font-prefix", type=str, required=False, default="icon-", help="Prefix of the font")
    parser.add_argument("--output-dir", type=str, required=False, default="../../src/Assets/Fonts/DesignSystemIcons", help="Output directory")
    args = parser.parse_args()
    build_font(args.font_name, args.font_map, args.font_prefix, args.output_dir)
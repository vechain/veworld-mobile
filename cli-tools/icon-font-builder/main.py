from typing import Literal
import fontforge
import argparse
import json
import os

CACHE_DIR = "./svg_cache"

def generate_map_file(map_data: dict[str, int], font_output: str):
    content = "export const designSystemIconMap = {%s}" % ", ".join(f"\"{key}\": {value}" for key, value in map_data.items())
    with open(f"{font_output}/designSystemIconMap.ts", "w") as f:
        f.write(content)
        f.close()

def build_font(font_name: str, font_map: str, font_prefix: str, font_output: str):
    font_map: dict[Literal["icons", "sets", "groups"], list[dict]] = json.load(open(font_map))

    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR, mode=0o777)

    font = fontforge.font()

    map_data = {}

    for icon in font_map["icons"]:
        with open(f"{CACHE_DIR}/{icon['name']}.svg", "w") as f:
            f.write(icon["content"])
            f.close()

        map_data[font_prefix + icon["name"]] = icon["code"]

        glyph = font.createChar(icon["code"], font_prefix + icon["name"])
        glyph.importOutlines(f"{CACHE_DIR}/{icon['name']}.svg")
    
    generate_map_file(map_data, font_output)
    font.generate(f"{font_output}/{font_name}.ttf")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="icon-font-builder")
    parser.add_argument("--font-map", type=str, required=False, default="./DesignSystemIcons.json", help="Path to the font map JSON file")
    parser.add_argument("--font-name", type=str, required=False, default="DesignSystemIcons", help="Name of the font")
    parser.add_argument("--font-prefix", type=str, required=False, default="icon-", help="Prefix of the font")
    parser.add_argument("--output-dir", type=str, required=False, default=".", help="Output directory")
    args = parser.parse_args()
    build_font(args.font_name, args.font_map, args.font_prefix, args.output_dir)
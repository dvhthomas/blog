import argparse
from pathlib import Path
from typing import Type
from json_schema_for_humans.generate import generate_from_filename
from json_schema_for_humans.generation_configuration import GenerationConfiguration


def generate_docs(schemaName: str, format: str):
    template_name = "js" if format == "html" else "md_nested"
    file_name = "html" if format == "html" else "md"

    outdir = Path(f"output")
    outdir.mkdir(parents=True, exist_ok=True)
    doc = outdir.joinpath(f"{schemaName}.{file_name}")
    schema_file = Path(f"schema/{schemaName}.schema.json")

    config = GenerationConfiguration(
        template_name=template_name,
        show_toc=True,
        link_to_reused_ref=False,
        collapse_long_descriptions=False,
    )
    generate_from_filename(schema_file, doc, config=config)
    print(f"Created {doc}...")


if __name__ == "__main__":
    """
    This generates a simple one-page HTML file in the output directory.
    """
    parser = argparse.ArgumentParser(
        description="Generate a simple schema documentation HTML page."
    )
    parser.add_argument(
        "--schema",
        type=str,
        required=True,
        help="The name of the schema without the '.schema.json' part of the filename, e.g., 'data' or 'config'",
    )
    args = parser.parse_args()
    generate_docs(schemaName=args.schema, format="html")
    generate_docs(schemaName=args.schema, format="md")

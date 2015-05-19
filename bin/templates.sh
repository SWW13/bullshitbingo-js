#!/bin/sh

SRC_DIR="$1"
DEST_FILE="$2"

if [ "$SRC_DIR" == "" ] || [ "$DEST_FILE" == "" ]
then
    echo "usage: $0 source_dir dest_file"
    echo "  e.g. $0 templates/out public/assets/js/tempaltes.js"
    exit 1
fi

# clear dest file
echo '' > "$DEST_FILE"

# append tempaltes
for file in `find "$SRC_DIR" -type f -name '*.js'`
do
    echo "processing file $file"
    cat "$file" >> "$DEST_FILE"
done

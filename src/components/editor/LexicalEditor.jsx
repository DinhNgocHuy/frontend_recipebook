import React, { useEffect, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { $getRoot, $getSelection } from "lexical";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
// Toolbar tối giản
import {
    useLexicalComposerContext
} from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_LOW
} from "lexical";
import { $createParagraphNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode } from "@lexical/rich-text";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND
} from "@lexical/list";

function Toolbar() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => true,
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    const setParagraph = () => {
        editor.update(() => {
            $setBlocksType($getSelection(), () => $createParagraphNode());
        });
    };
    const setHeading = (level) => {
        editor.update(() => {
            $setBlocksType($getSelection(), () => $createHeadingNode(level));
        });
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 border rounded mb-2">
            <button type="button" className="btn-base border px-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            >B</button>
            <button type="button" className="btn-base border px-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            ><i>I</i></button>
            <button type="button" className="btn-base border px-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            ><u>U</u></button>

            <span className="mx-2">|</span>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={setParagraph}>P</button>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => setHeading("h1")}>H1</button>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => setHeading("h2")}>H2</button>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => setHeading("h3")}>H3</button>

            <span className="mx-2">|</span>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}>• List</button>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)}>1. List</button>
            <button type="button" className="btn-base border px-2" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND)}>Xóa List</button>

        </div>
    );
}

export default function LexicalEditor({ initialHTML = "", onChange, className = "" }) {
    const initialHtmlRef = React.useRef(initialHTML);
    const theme = useMemo(() => ({
        text: {
            underline: "lex-underline",
        },
    }), []);

    const initialConfig = {
        namespace: "recipe-editor",
        theme,
        onError: (e) => console.error(e),
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <Toolbar />
            <RichTextPlugin
                contentEditable={
                    <ContentEditable className={`editor-content min-h-[200px] p-3 border rounded focus:outline-none ${className}`} />
                }

            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoFocusPlugin />
            <OnChangePlugin
                onChange={(editorState, editor) => {
                    // xuất HTML mỗi lần thay đổi
                    editorState.read(() => {
                        const html = $generateHtmlFromNodes(editor);
                        onChange?.(html);
                    });
                }}
            />
            {/* nạp initialHTML */}
            <HTMLLoader html={initialHtmlRef.current} />
        </LexicalComposer>
    );
}

// Nạp HTML ban đầu vào editor
function HTMLLoader({ html }) {
    const [editor] = useLexicalComposerContext();
    const loadedRef = React.useRef(false);
    useEffect(() => {
        if (loadedRef.current) return;      // chỉ chạy 1 lần
        loadedRef.current = true;
        if (!html) return;
        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            nodes.forEach(n => root.append(n));
        });
    }, [editor]);
    return null;
}

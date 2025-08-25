import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import Constants from '@/data/Constants';
import { aquaBlue } from "@codesandbox/sandpack-themes";

function CodeEditor({ codeResp, isReady }: { codeResp: string, isReady: boolean }) {
    return (
        <div>
            {isReady ? (
                <Sandpack
                    template="vanilla"
                    theme={aquaBlue}
                    options={{
                        showNavigator: true,
                        showTabs: true,
                        editorHeight: 600,
                    }}
                    customSetup={{
                        dependencies: {
                            ...(Constants as any).DEPENDANCY,
                        },
                    }}
                    files={{    
                        "/index.html":`${codeResp}`,
                        "/style.css":`${codeResp}`,
                        "/script.js":`${codeResp}`,
                    }}
                />
            ) : (
                <div className="w-full bg-[#1e293b] h-[600px] rounded-lg flex items-center justify-center">
                    <p className="text-white">Loading Code...</p>
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
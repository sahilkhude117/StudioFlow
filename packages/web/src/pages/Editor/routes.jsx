import * as React from 'react';
import { Routes, Route} from 'react-router-dom';
import CreateFlow from './create';
import EditorPage from './index';

export default function EditorRoutes() {
    return (
        <Routes>
            <Route path="/create" element={<CreateFlow/>}/>            
            <Route path="/:flowId" element={<EditorPage/>}/>            
        </Routes>
    );
}
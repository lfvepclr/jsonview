import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExpandContextType {
    expandedPaths: Set<string>;
    togglePath: (path: string) => void;
    isPathExpanded: (path: string) => boolean;
}

const ExpandContext = createContext<ExpandContextType | undefined>(undefined);

export const ExpandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    const togglePath = (path: string) => {
        setExpandedPaths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const isPathExpanded = (path: string) => {
        return expandedPaths.has(path);
    };

    return (
        <ExpandContext.Provider value={{ expandedPaths, togglePath, isPathExpanded }}>
            {children}
        </ExpandContext.Provider>
    );
};

export const useExpandContext = () => {
    const context = useContext(ExpandContext);
    if (!context) {
        throw new Error('useExpandContext must be used within an ExpandProvider');
    }
    return context;
};
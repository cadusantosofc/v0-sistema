import { createContext, useContext, useState } from 'react';

interface ApplicationsContextType {
    applications: any[];
    addApplication: (application: any) => void;
    removeApplication: (id: string) => void;
    updateApplication: (id: string, updatedData: any) => void;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
    const [applications, setApplications] = useState<any[]>([]);

    const addApplication = (application: any) => {
        setApplications(prev => [...prev, application]);
    };

    const removeApplication = (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    const updateApplication = (id: string, updatedData: any) => {
        setApplications(prev => 
            prev.map(app => 
                app.id === id ? { ...app, ...updatedData } : app
            )
        );
    };

    return (
        <ApplicationsContext.Provider value={{ applications, addApplication, removeApplication, updateApplication }}>
            {children}
        </ApplicationsContext.Provider>
    );
}

export function useApplications() {
    const context = useContext(ApplicationsContext);
    if (context === undefined) {
        throw new Error('useApplications must be used within an ApplicationsProvider');
    }
    return context;
}

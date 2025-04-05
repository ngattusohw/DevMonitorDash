import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types";
import { fetchProjects, createProject as apiCreateProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject } from "@/lib/api";
import { useDashboard } from "@/contexts/dashboard-context";

// Mock user ID for demonstration purposes
const MOCK_USER_ID = 1;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { refreshTrigger } = useDashboard();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects(MOCK_USER_ID);
      setProjects(data);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);
  
  const getProject = (id: number) => {
    return projects.find(project => project.id === id);
  };
  
  const createProject = async (name: string, description?: string) => {
    try {
      const newProject = await apiCreateProject({
        name,
        description,
        userId: MOCK_USER_ID
      });
      
      setProjects(prevProjects => [...prevProjects, newProject]);
      return newProject;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };
  
  const updateProject = async (id: number, data: Partial<Project>) => {
    try {
      const updatedProject = await apiUpdateProject(id, data);
      
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      return updatedProject;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };
  
  const deleteProject = async (id: number) => {
    try {
      await apiDeleteProject(id);
      
      setProjects(prevProjects => 
        prevProjects.filter(project => project.id !== id)
      );
      
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };
  
  return { projects, loading, error, getProject, createProject, updateProject, deleteProject, refetch: fetchData };
}

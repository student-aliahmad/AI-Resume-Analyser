import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';
import ResumeCard from '~/components/ResumeCard';
import { useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

// Resume Data Type
interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  imagePath: string;
  resumePath: string;
  feedback: any;
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // 1. Clerk Auth Check & Redirect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/upload');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // 2. Load Resumes from localStorage
  useEffect(() => {
    const loadResumes = () => {
      setLoadingResumes(true);
      try {
        const loadedResumes: Resume[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('resume:')) {
            const item = localStorage.getItem(key);
            if (item) {
              loadedResumes.push(JSON.parse(item));
            }
          }
        }
        setResumes(loadedResumes);
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadResumes();
    }
  }, [isLoaded, isSignedIn]);

  const handleDeleteResume = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem(`resume:${id}`);

    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  if (!isLoaded) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Loading..." />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resume found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Scanning..." />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={handleDeleteResume}
              />
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
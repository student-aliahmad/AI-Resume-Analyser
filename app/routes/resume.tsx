import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import { useAuth } from "@clerk/clerk-react";

export const meta = () => ([
    { title: 'Resumind | Review'},
    { name: 'description', content: 'Detailed overview of your resume'},
])

// Interface for Feedback Type Safety
 interface Feedback {
  overallScore: number;
  toneAndStyle: {
    score: number;
  };
  content: {
    score: number;
  };
  structure: {
    score: number;
  };
  skills: {
    score: number;
  };
}
const Resume = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

useEffect(() => {
  if (!isLoaded && isSignedIn) {
    navigate('/upload');
  }
}, [isLoaded, isSignedIn, navigate]);
  
  // 2. Load Resume Data from LocalStorage
  useEffect(() => {
    const loadResumeData = () => {
      if (!id) return;

      try {
        const item = localStorage.getItem(`resume:${id}`);
        if (!item) return;

        const data = JSON.parse(item);
        
        // Data mapping from upload step
        if (data.imagePath) setImageUrl(data.imagePath);
        if (data.resumePath) setResumeUrl(data.resumePath);
        if (data.feedback) setFeedback(data.feedback);

      } catch (error) {
        console.error("Error loading resume from storage:", error);
      }
    };

    if (isLoaded && isSignedIn) {
      loadResumeData();
    }
  }, [id, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Loading..." />
      </div>
    );
  }

  return (
    <main className="pt-0">
      <nav className="resume-nav p-4">
        <Link to="/" className="back-button flex items-center gap-2">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left Section: Image/Resume Preview */}
        <section className="feedback-section bg-cover min-h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl w-fit">
              <a href={resumeUrl || imageUrl} target="_blank" rel="noopener noreferrer">
                <img src={imageUrl} className="w-full h-full object-contain rounded-2xl" alt="resume preview" title="resume" />
              </a>
            </div>
          )}
        </section>

        {/* Right Section: AI Review Feedback */}
        <section className="feedback-section p-6 w-full">
          <h2 className="text-4xl !text-black font-bold mb-6">Resume Review</h2>
          
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback as any} />
              <ATS score={feedback.overallScore} suggestions={[]} />
              <Details feedback={feedback as any} />
            </div>
          ) : (
            <div className="flex justify-center items-center py-10">
              <img src="/images/resume-scan-2.gif" className="w-full max-w-md" alt="Analyzing..." />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar';
import { convertPdfToImage, extractPdfText } from '~/lib/pdf2img';
import { useGeminiStore } from '~/lib/gemini';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from './constants';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
const upload = () => {
  const { analyzeResume, isLoading: isAnalyzing } = useGeminiStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }:
    { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
    setIsProcessing(true);
    setStatusText('Converting PDF to image...');

    // const uploadedFile = await fs.upload([file]);
    // if(!uploadedFile) return setStatusText('Error: Failed to upload file');
    // setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) {
      setIsProcessing(false);
      return setStatusText('Error: Failed to convert PDF to image');
    }

    const resumeText = await extractPdfText(file);

    if (!resumeText) {
      setIsProcessing(false);
      return setStatusText('Error: Could not extract text from PDF');
    }

    setStatusText('Analyzing with Gemini AI...');
    //Format Prompt for Gemini AI 
    const promptContext = prepareInstructions({ jobTitle, jobDescription });
    const resumeContent = `
        RESUME TEXT:
        ${resumeText}

        COMPANY:
        ${companyName}

        JOB TITLE:
        ${jobTitle}

        INSTRUCTIONS:
        ${promptContext}
        `;
    // Gemini call
    const feedback = await analyzeResume(resumeContent, jobDescription);
    if (!feedback) {
      setIsProcessing(false);
      return setStatusText('Error: Failed to analyze resume');
    }
    setStatusText('Saving analysis data...');
    const uuid = generateUUID();

    //Image preview URL
    const imagePreviewUrl = URL.createObjectURL(imageFile.file!);

    const data = {
      id: uuid,
      resumePath: file.name,
      imagePath: imagePreviewUrl,
      companyName, jobTitle, jobDescription,
      feedback: feedback,
    };

    // Puter kv ki jagah localStorage me save
    localStorage.setItem(`resume:${uuid}`, JSON.stringify(data));

    setStatusText('Analysis complete, redirecting...');
    console.log(data);
    setIsProcessing(false);
    navigate(`/resume/${uuid}`);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;
    if (!file) {
      alert("Please upload a resume PDF first!");
      return;
    }
    await handleAnalyze({ companyName, jobTitle, jobDescription, file });
  }

  return (
    <>
    <SignedIn>
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement
              tips</h2>
          )}
          {!isProcessing && (
            <form id="uplod-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
    </SignedIn>

    {/* Agar user signed out hai, toh automatically sign-in page par bhej dega bina blink kiye */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      </>
  );
}

export default upload;

import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

// TypeScript Interface
interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  feedback: {
    overallScore?: number;
    ATS?: {
      score?: number;
    };
    [key: string]: any;
  };
}

const ResumeCard = ({
  resume,
  onDelete,
}: {
  resume: Resume;
  onDelete: (id: string) => void;
}) => {
  const { id, companyName, jobTitle, feedback, imagePath } = resume;

  // Safe score fallback (checks overallScore or ATS score)
  const score = feedback?.overallScore ?? feedback?.ATS?.score ?? 0;

  return (
    <div className="relative">
    <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
          {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
          {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={score} />
        </div>
      </div>

      {imagePath && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={imagePath}
              alt="resume preview"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
    </Link>

     {/* Delete Button */}
      <button
        type="button"
        onClick={() => onDelete(id)}
        className="absolute top-3 right-3 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 z-10"
      >
        Delete
      </button>
    </div>
  );
};

export default ResumeCard;
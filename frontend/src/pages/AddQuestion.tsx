import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, FormEvent, FC } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient.js";
import type { Question } from "../types/quiz.types.js";
import { topicData } from "../constants/topics.constants.js";
import { renderKaTeX } from "../utils/latexRenderer";
import "../styles/AddQuestion.css";


const API_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGEKIT_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;


const validateImageLink = (url: string): boolean => {
  const imageRegex = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
  if (!imageRegex.test(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};


const AddQuestion: FC = () => {
  const initialState: Question = {
    examId: "",
    yearAsked: "",
    topicId: "",
    subtopicId: "",
    questionText: "",
    imageUrl: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    solution: "",
  };


  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [useUpload, setUseUpload] = useState<boolean>(true);
  const [formData, setFormData] = useState<Question>(initialState);


  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    document.title = "Add Question | AptiVerse";
    return () => {
      document.title = "AptiVerse";
    };
  }, []);


  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;


    setFormData((prev) => {
      const newState = {
        ...prev,
        [name]:
          name === "yearAsked" ? (value === "" ? "" : parseInt(value)) : value,
      };
      if (name === "topicId") newState.subtopicId = "";
      return newState as Question;
    });
  };


  const handleLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };


  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    setUploading(true);
    setUploadProgress(0);


    try {
      const authRes = await axios.get(`${API_BASE_URL}/api/imagekit-auth`);
      const { token, expire, signature } = authRes.data;


      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("fileName", file.name);
      uploadData.append("publicKey", IMAGEKIT_KEY);
      uploadData.append("token", token);
      uploadData.append("expire", expire);
      uploadData.append("signature", signature);
      uploadData.append("folder", "/question_images");


      const response = await axios.post(
        `https://upload.imagekit.io/api/v1/files/upload`,
        uploadData,
        {
          onUploadProgress: (p) => {
            if (p.total) {
              setUploadProgress(Math.round((p.loaded * 100) / p.total));
            }
          },
        },
      );


      if (response.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();


    if (
      !useUpload &&
      formData.imageUrl &&
      !validateImageLink(formData.imageUrl)
    ) {
      alert("Please provide a valid image URL.");
      return;
    }


    setLoading(true);


    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;


    if (!token) {
      alert("Not logged in, unauthorized access");
      setLoading(false);
      return;
    }


    try {
      await axios.post(`${API_BASE_URL}/api/admin/addQuestion`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Question added successfully!");
      setFormData(initialState);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container add-question-page">
      <div className="formSection">
        <form onSubmit={handleSubmit} className="form">
          <div className="row">
            <div className="inputGroup">
              <label>Exam ID</label>
              <input
                name="examId"
                value={formData.examId}
                placeholder="e.g. CAT"
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="inputGroup">
              <label>Year</label>
              <input
                name="yearAsked"
                value={formData.yearAsked}
                type="number"
                placeholder="YEAR"
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>


          <div className="row">
            <div className="inputGroup">
              <label>Topic</label>
              <select
                name="topicId"
                value={formData.topicId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Choose Topic</option>
                {Object.keys(topicData).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="inputGroup">
              <label>Subtopic</label>
              <select
                name="subtopicId"
                value={formData.subtopicId}
                onChange={handleChange}
                className="input"
                disabled={!formData.topicId}
                required
              >
                <option value="">Choose Subtopic</option>
                {formData.topicId &&
                  topicData[formData.topicId]?.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
              </select>
            </div>
          </div>


          <div className="inputGroup">
            <label>Question Text</label>
            <textarea
              name="questionText"
              value={formData.questionText}
              placeholder="e.g. If x = $\sqrt{2}$..."
              onChange={handleChange}
              className="textarea"
              required
            />
          </div>


          <div className="inputGroup">
            <div className="labelRow">
              <label>Question Image</label>
              <button
                type="button"
                className="toggleBtn"
                onClick={() => {
                  setUseUpload(!useUpload);
                  handleRemoveImage();
                }}
              >
                {useUpload ? "Switch to Image Link" : "Switch to File Upload"}
              </button>
            </div>


            {useUpload ? (
              !formData.imageUrl ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="input"
                />
              ) : (
                <div className="imageStatusBadge">
                  <span>Uploaded image successfully</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="removeBtn"
                  >
                    Remove
                  </button>
                </div>
              )
            ) : (
              <div className="linkInputWrapper">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  placeholder="Paste image link"
                  onChange={handleLinkChange}
                  className={`input ${formData.imageUrl && !validateImageLink(formData.imageUrl) ? "inputError" : ""}`}
                />
              </div>
            )}
            {uploading && (
              <div className="progressWrapper">
                <div
                  className="progressBar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>


          <div className="optionsGrid">
            {["A", "B", "C", "D"].map((opt) => (
              <div key={opt} className="inputGroup">
                <label>Option {opt}</label>
                <input
                  name={`option${opt}`}
                  value={
                    (formData[`option${opt}` as keyof Question] as string) || ""
                  }
                  placeholder={`Option ${opt}`}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            ))}
          </div>


          <div className="row">
            <div className="inputGroup">
              <label>Correct Choice</label>
              <select
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="input"
              >
                {["A", "B", "C", "D"].map((opt) => (
                  <option key={opt} value={opt}>
                    Option {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div className="inputGroup">
            <label>Solution</label>
            <textarea
              name="solution"
              value={formData.solution}
              placeholder="Explain the solution..."
              onChange={handleChange}
              className="textarea"
              style={{ height: "120px" }}
              required
            />
          </div>


          <button
            type="submit"
            className="submitBtn"
            disabled={loading || uploading}
          >
            {loading ? "Adding..." : "Add Question"}
          </button>
        </form>
      </div>


      <div className="previewSection">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libertinus+Math&display=swap');


          .previewSection .textbook-solution-container span.math-segment {
          margin-left: 0 !important;
         }


         .previewSection, .solutionContainer {
         font-family: 'Libertinus Math', serif;
         }
        `}</style>
        <h2 className="previewTitle">Live Preview</h2>
        <div className="quizTestContainer">
          <div className="quizHeader">
            <span>
              {formData.examId || "EXAM"} / {formData.yearAsked || "YEAR"}
            </span>
            <div className="timer">⏱ Time: 00:00</div>
          </div>
          <div className="topicBreadcrumb">
            {formData.topicId || "Topic"} <span>&gt;</span>{" "}
            {formData.subtopicId || "Subtopic"}
          </div>
          <div className="questionSection">
            <div className="questionMainText">
              <span className="question-number" style={{ marginTop: "3px" }}>
                Q.1{" "}
              </span>
              {renderKaTeX(formData.questionText || "Question text...", false)}
            </div>
            {formData.imageUrl && (
              <div className="previewImageContainer">
                <img
                  src={formData.imageUrl}
                  alt="Question"
                  className="questionImage"
                />
              </div>
            )}
            <div className="optionsContainer">
              {["A", "B", "C", "D"].map((opt) => (
                <div key={opt} className="optionItem">
                  <div className="optionLetter">{opt}</div>
                  <span className="optionText">
                    {renderKaTeX(
                      (formData[`option${opt}` as keyof Question] as string) ||
                        "---",
                      false,
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="solutionContainer">
              <p className="solutionLabel">Solution:</p>
              {renderKaTeX(formData.solution || "Solution steps...", true)}
              <div className="correctIndicator">
                Correct Answer: <strong>{formData.correctAnswer}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AddQuestion;
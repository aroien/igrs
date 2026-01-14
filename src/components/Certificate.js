import React from "react";

const Certificate = ({ student, course, completionDate, certificateId }) => {
  return (
    <div className="w-full p-5 flex justify-center bg-gray-100">
      <div className="w-full max-w-4xl aspect-video bg-white relative shadow-2xl">
        {/* Certificate Border */}
        <div className="absolute top-5 left-5 right-5 bottom-5 border-4 border-blue-600 rounded-lg">
          <div className="absolute top-2 left-2 right-2 bottom-2 border border-purple-600"></div>

          {/* Content */}
          <div className="p-12 md:p-20 h-full flex flex-col justify-between relative">
            {/* Header */}
            <div className="text-center">
              {/* Logo */}
              <div className="mb-5 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-white tracking-widest">
                    IGRS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                Institute of GIS and Remote Sensing
              </h1>
              <p className="text-xl md:text-2xl text-blue-600 font-bold tracking-widest uppercase">
                Certificate of Completion
              </p>
            </div>

            {/* Divider */}
            <div className="flex justify-center">
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            </div>

            {/* Body */}
            <div className="text-center flex flex-col gap-4">
              <p className="text-lg text-gray-600">This is to certify that</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 inline-block mx-auto">
                {student.name}
              </h2>
              <p className="text-lg text-gray-600">
                has successfully completed the course
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-600 my-2">
                {course.title}
              </h3>
              <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
                {course.description}
              </p>

              {/* Details */}
              <div className="flex flex-wrap justify-center gap-10 my-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Duration:
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {course.duration}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Level:
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {course.level}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Instructor:
                  </span>
                  <span className="text-base text-gray-800 font-semibold">
                    {course.teacherName}
                  </span>
                </div>
              </div>

              <p className="text-base text-gray-600 italic">
                Completed on:{" "}
                {new Date(completionDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8">
              <div className="flex justify-around flex-wrap gap-8">
                <div className="text-center min-w-max">
                  <div className="w-48 h-0.5 bg-gray-800 mb-2"></div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Director, IGRS
                  </p>
                </div>
                <div className="text-center min-w-max">
                  <div className="w-48 h-0.5 bg-gray-800 mb-2"></div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Course Instructor
                  </p>
                </div>
              </div>
              <div className="text-center mt-5 text-xs text-gray-400 tracking-wider uppercase">
                Certificate ID: {certificateId}
              </div>
            </div>

            {/* Seal */}
            <div className="absolute bottom-12 right-20 md:bottom-16 md:right-28">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white outline-2 outline-blue-600">
                <div className="text-center text-white flex flex-col items-center">
                  <span className="text-lg font-black tracking-widest">
                    IGRS
                  </span>
                  <span className="text-xs font-semibold">2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;

import React from "react";

export default function Contact() {
  return (
    <section id="contact" className="relative">
      <div className="container px-5 py-10 mx-auto flex sm:flex-nowrap flex-wrap">
        <div className="lg:w-full md:w-full bg-gray-900 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
          <div className="bg-gray-900 lg:w-full relative flex flex-wrap py-6 rounded shadow-md">
            <div className="lg:w-1/3 px-6">
                <h2 className="title-font font-semibold text-white tracking-widest text-xs">
                    EMAIL
                </h2>
                <a className="text-indigo-400 leading-relaxed">
                  zhang.william@columbia.edu
                  </a>
            </div>

            <div className="lg:w-1/3 px-6">

                <h2 className="title-font font-semibold text-indigo-400 tracking-widest text-xs">
                    <a href='https://www.linkedin.com/in/william-y-zhang/'>LINKEDIN</a>
                </h2>
            </div>

            
          </div>
        </div>
       
      </div>
    </section>
  );
}
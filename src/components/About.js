import React from "react";

export default function About() {
    return(
        <section id="about">
        <div className="container mx-auto flex px-10 py-16 md:flex-row flex-col items-center">
            <div className="px-10 pl-24 lg:w-1/3 md:w-1/2 w-5/6">
                <img
                    className="object-cover object-center rounded"
                    alt="hero"
                    src="./images/pfp.jpg"
                />
            </div>
            <div className="lg:flex-grow md:w-1/2 lg:pl-24 pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-5xl text-4xl mb-4 font-bold text-red-800">
                Hey I'm William!
                {/* <br className="text m hidden lg:inline-block" /> */}
            </h1>
            <h2 className="title-font sm:text-xl text-2xl mb-4 font-bold text-pink-700">
                interdisciplinary problem solver
            </h2>
            <p className="mb-8 leading-relaxed text-gray-900">
                My passion is to create meaningful experiences at the intersection of technology and art.
                I draw from a background in computer science, music, and writing to collaborate on diverse teams and find unique solutions to technical and creative challenges.
            </p>
            <div className="flex justify-center">
                {/* <a
                href="#projects"
                className="ml-4 text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">
                Cool things I've made
                </a> */}
                {/* <a
                href="#contact"
                className="inline-flex text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg">
                Work With Me
                </a> */}
            </div>
            </div>
        </div>
        </section>
    );
}
import React from 'react';
import { Hero } from '../components';

export default function Page(): JSX.Element {
  return (
    <>
      <main className="content content-page">
        <Hero title="Oops! That page can’t be found." />
        <div className="wrap">
          <div>
            <div>
              <p>
                The page you were looking for does not exist or is no longer
                available.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

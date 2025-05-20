-- Create users table (for the blogger)
CREATE TABLE users (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table (including drafts)
CREATE TABLE posts (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER REFERENCES users(id),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    "published_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table for categorizing posts
CREATE TABLE tags (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL
);

-- Create post_tags junction table for many-to-many relationship
CREATE TABLE post_tags (
    "post_id" INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);

-- Insert SkipLabs team members
INSERT INTO users (username, email, password_hash) VALUES
    ('ada_lovelace', 'countess@analytical-engine.dev', 'analyticalEngine101!'),
    ('alan_turing', 'enigma@bletchley-park.ai', 'works_onMy_machine!'),
    ('grace_hopper', 'admiral@cobol.navy', 'ActualBugFound!'),
    ('linus_torvalds', 'just@merge.it', 'iH8Windows!'),
    ('tim_berners_lee', 'sir@w3c.www', 'www.password.com'),
    ('margaret_hamilton', 'director@apollo-guidance.space', 'ToTheMoon!'),
    ('steve_jobs', 'ceo@one-more-thing.apple', 'OneMoreThing2007'),
    ('bill_gates', 'windows@blue-screen.ms', 'BSODinDemoFTW!$'),
    ('vint_cerf', 'father@internet.protocol', 'TCPIPurHeart!'),
    ('barbara_liskov', 'professor@substitution.mit', 'SubstitutionPrinciple!');

-- Insert sample tags
INSERT INTO tags (name) VALUES
    ('Technology'),
    ('Programming'),
    ('Web Development');

-- Insert sample posts
INSERT INTO posts (author_id, title, content, status, published_at) VALUES
    (1, 'Why Programming Should Be More Poetic', 'As the first programmer, I must say these modern languages lack a certain artistic flair. Where are the punch cards? Where is the poetry in your syntax? Back in my day, we had to write algorithms with STYLE...', 'published', '1843-12-10'::TIMESTAMP), -- Publication of her notes on the Analytical Engine
    
    (2, 'Debug or Not Debug: That is the Question', 'I propose a new test: if your code can fix itself, it might be sentient. Speaking of which, has anyone seen my chess algorithm? It keeps beating me and then deleting itself...', 'published', '1950-10-01'::TIMESTAMP), -- Publication of "Computing Machinery and Intelligence" introducing the Turing Test
    
    (3, 'Found Another Bug! 🪲', 'LITERALLY found another bug in the system today. Unlike that moth from 1947, this one was just a spider. Sadly, my colleagues won''t let me tape it into the logbook. Standards have really declined...', 'published', '1947-09-09'::TIMESTAMP), -- The date the first actual computer bug was found
    
    (4, 'Just a Friendly Kernel Update', 'Dear Windows users: Your OS is like a bowl of spaghetti code. Love, Linus. P.S. Yes, I''m still taking anger management classes.', 'published', '1991-08-25'::TIMESTAMP), -- First Linux announcement
    
    (5, 'HTTP 418: I''m a Teapot', 'Looking back, maybe I shouldn''t have included that status code. But in my defense, I was really into British tea culture when designing HTTP protocols...', 'published', '1989-03-12'::TIMESTAMP), -- Proposal for the World Wide Web
    
    (6, 'Space: The Final Software Frontier', 'When NASA said they needed code that wouldn''t crash, I didn''t realize they meant it LITERALLY wouldn''t crash. Still proud we landed on the moon with less memory than a modern calculator!', 'published', '1969-07-20'::TIMESTAMP), -- Apollo 11 moon landing
    
    (7, 'Think Different About Turtlenecks', 'Just dropped my new fashion line: it''s exactly one black turtleneck. That''s it. That''s the line. Available for only $999.', 'draft', NULL),
    
    (8, 'Blue Screen of Success', 'Exciting news: We''ve made the blue screen of death more user-friendly! Now it shows emoji before crashing. 🙃', 'published', '1995-08-24'::TIMESTAMP), -- Windows 95 release date
    
    (9, 'RFC 2549: IP over Avian Carriers', 'My latest protocol proposal involves strapping tiny routers to pigeons. Latency is terrible but bandwidth is surprising! P.S. Don''t ask about packet loss...', 'published', '1974-05-01'::TIMESTAMP), -- TCP protocol development
    
    (10, 'The Substitution Principle of Coffee', 'Any coffee can be substituted with a stronger coffee without breaking the programmer. This is my contribution to computer science today.', 'published', '1987-01-01'::TIMESTAMP); -- Around when she developed the Liskov Substitution Principle

-- Link posts to tags
INSERT INTO post_tags (post_id, tag_id) VALUES
    (1, 2), (1, 1),  -- Ada's post: Programming, Technology
    (2, 2), (2, 1),  -- Turing's post: Programming, Technology
    (3, 2), (3, 1),  -- Grace's post: Programming, Technology
    (4, 2), (4, 1),  -- Linus's post: Programming, Technology
    (5, 3), (5, 1),  -- Tim's post: Web Development, Technology
    (6, 1), (6, 2),  -- Margaret's post: Technology, Programming
    (7, 1),          -- Steve's draft: Technology
    (8, 1), (8, 2),  -- Bill's post: Technology, Programming
    (9, 1), (9, 3),  -- Vint's post: Technology, Web Development
    (10, 2), (10, 1); -- Barbara's post: Programming, Technology

-- =====================================================
-- BUSINESS BRIDGED - DEMO DATA SEED (FIXED)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS (Base users for all roles)
-- =====================================================
-- Note: In production, use proper password hashing
-- For demo, we're using placeholder hashes

-- Entrepreneurs (5)
INSERT INTO users (user_id, full_name, email, password, role, phone, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Thandi Mokoena', 'thandi@example.com', '$2b$10$YourHashedPasswordHere', 'entrepreneur', '+27 71 234 5678', NOW() - INTERVAL '6 months'),
('22222222-2222-2222-2222-222222222222', 'Lebo Khumalo', 'lebo@example.com', '$2b$10$YourHashedPasswordHere', 'entrepreneur', '+27 72 345 6789', NOW() - INTERVAL '5 months'),
('33333333-3333-3333-3333-333333333333', 'Nomsa Dlamini', 'nomsa@example.com', '$2b$10$YourHashedPasswordHere', 'entrepreneur', '+27 73 456 7890', NOW() - INTERVAL '4 months'),
('44444444-4444-4444-4444-444444444444', 'Sipho Ndlovu', 'sipho@example.com', '$2b$10$YourHashedPasswordHere', 'entrepreneur', '+27 74 567 8901', NOW() - INTERVAL '3 months'),
('55555555-5555-5555-5555-555555555555', 'Zanele Zulu', 'zanele@example.com', '$2b$10$YourHashedPasswordHere', 'entrepreneur', '+27 75 678 9012', NOW() - INTERVAL '2 months'),

-- Mentors (3)
('66666666-6666-6666-6666-666666666666', 'Sarah Khumalo', 'sarah.mentor@example.com', '$2b$10$YourHashedPasswordHere', 'mentor', '+27 76 789 0123', NOW() - INTERVAL '8 months'),
('77777777-7777-7777-7777-777777777777', 'Thabo Molefe', 'thabo.mentor@example.com', '$2b$10$YourHashedPasswordHere', 'mentor', '+27 77 890 1234', NOW() - INTERVAL '8 months'),
('88888888-8888-8888-8888-888888888888', 'Lerato Ndlovu', 'lerato.mentor@example.com', '$2b$10$YourHashedPasswordHere', 'mentor', '+27 78 901 2345', NOW() - INTERVAL '8 months'),

-- Funders (3)
('99999999-9999-9999-9999-999999999999', 'VCC Growth Fund', 'info@vccgrowth.co.za', '$2b$10$YourHashedPasswordHere', 'funder', '+27 11 123 4567', NOW() - INTERVAL '12 months'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Women Investment Network', 'info@win.co.za', '$2b$10$YourHashedPasswordHere', 'funder', '+27 21 234 5678', NOW() - INTERVAL '10 months'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'GreenTech Ventures', 'info@greentech.co.za', '$2b$10$YourHashedPasswordHere', 'funder', '+27 31 345 6789', NOW() - INTERVAL '9 months');

-- =====================================================
-- 2. ENTREPRENEURS
-- =====================================================
INSERT INTO entrepreneurs (
    entrepreneur_id, business_name, industry, cicp_number,
    verified, compliance_completed, grooming_completed, stress_test_passed,
    fixed_cost, variable_monthly_cost, readiness_score
) VALUES
-- Thandi's Catering
('11111111-1111-1111-1111-111111111111', 'Thandi''s Catering', 'Food & Beverage', 'CICP00123',
 TRUE, TRUE, TRUE, TRUE,
 35000.00, 15000.00, 82),

-- Lebo Sneakers
('22222222-2222-2222-2222-222222222222', 'Lebo Sneakers', 'Retail', 'CICP00124',
 FALSE, TRUE, FALSE, FALSE,
 25000.00, 12000.00, 58),

-- Nomsa Retail
('33333333-3333-3333-3333-333333333333', 'Nomsa Retail', 'Retail', 'CICP00125',
 TRUE, TRUE, TRUE, TRUE,
 45000.00, 18000.00, 88),

-- Sipho Tech
('44444444-4444-4444-4444-444444444444', 'Sipho Tech Solutions', 'Technology', 'CICP00126',
 FALSE, FALSE, FALSE, FALSE,
 15000.00, 8000.00, 32),

-- Zanele Beauty
('55555555-5555-5555-5555-555555555555', 'Zanele Beauty', 'Services', 'CICP00127',
 TRUE, TRUE, TRUE, FALSE,
 22000.00, 10000.00, 65);

-- =====================================================
-- 3. GROOMING PROGRESS
-- =====================================================
INSERT INTO grooming_progress (entrepreneur_id, status, quiz_score, business_report_url, last_updated) VALUES
('11111111-1111-1111-1111-111111111111', 'completed', 85, '/reports/thandi-catering-business-plan.pdf', NOW() - INTERVAL '2 weeks'),
('22222222-2222-2222-2222-222222222222', 'in_progress', 62, NULL, NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'completed', 92, '/reports/nomsa-retail-business-plan.pdf', NOW() - INTERVAL '1 month'),
('44444444-4444-4444-4444-444444444444', 'in_progress', 28, NULL, NOW() - INTERVAL '1 week'),
('55555555-5555-5555-5555-555555555555', 'completed', 78, '/reports/zanele-beauty-business-plan.pdf', NOW() - INTERVAL '2 months');

-- =====================================================
-- 4. BUSINESS PLANS
-- =====================================================
INSERT INTO business_plan (entrepreneur_id, plan_content_json, document_url, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 
 '{"executiveSummary": "Premium catering service in Soweto", "financials": {"projectedRevenue": 1200000, "profitMargin": 25}}',
 '/documents/thandi-catering-plan.pdf', NOW() - INTERVAL '2 months'),

('33333333-3333-3333-3333-333333333333',
 '{"executiveSummary": "Convenience store chain expansion", "financials": {"projectedRevenue": 2500000, "profitMargin": 18}}',
 '/documents/nomsa-retail-plan.pdf', NOW() - INTERVAL '1 month'),

('55555555-5555-5555-5555-555555555555',
 '{"executiveSummary": "Organic beauty products line", "financials": {"projectedRevenue": 800000, "profitMargin": 35}}',
 '/documents/zanele-beauty-plan.pdf', NOW() - INTERVAL '3 weeks');

-- =====================================================
-- 5. STRESS TESTS
-- =====================================================
INSERT INTO stress_test (entrepreneur_id, simulation_score, passed, attempt_number, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 85, TRUE, 1, NOW() - INTERVAL '3 weeks'),
('11111111-1111-1111-1111-111111111111', 92, TRUE, 2, NOW() - INTERVAL '2 weeks'),
('22222222-2222-2222-2222-222222222222', 45, FALSE, 1, NOW() - INTERVAL '1 week'),
('22222222-2222-2222-2222-222222222222', 58, FALSE, 2, NOW() - INTERVAL '5 days'),
('33333333-3333-3333-3333-333333333333', 88, TRUE, 1, NOW() - INTERVAL '1 month'),
('44444444-4444-4444-4444-444444444444', 32, FALSE, 1, NOW() - INTERVAL '2 weeks'),
('55555555-5555-5555-5555-555555555555', 62, FALSE, 1, NOW() - INTERVAL '3 weeks'),
('55555555-5555-5555-5555-555555555555', 71, TRUE, 2, NOW() - INTERVAL '1 week');

-- =====================================================
-- 6. MENTOR LOGS (FIXED - removed 'pending' values)
-- =====================================================
INSERT INTO mentor_log (mentor_id, entrepreneur_id, visit_date, notes, vouch_status, created_at) VALUES
-- Sarah with Thandi
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 months', 
 'Discussed financial planning and cash flow management. Thandi has good understanding of her numbers.', 'approved', NOW() - INTERVAL '2 months'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 month',
 'Reviewed business plan and market analysis. Recommended focusing on corporate events.', 'approved', NOW() - INTERVAL '1 month'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 week',
 'Final review before investor meeting. Business is ready for funding.', 'approved', NOW() - INTERVAL '1 week'),

-- Thabo with Lebo
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 weeks',
 'Discussed supply chain issues. Lebo needs help finding local suppliers.', 'not_approved', NOW() - INTERVAL '3 weeks'),
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 week',
 'Reviewed marketing strategy. Recommended social media focus.', 'approved', NOW() - INTERVAL '1 week'),

-- Lerato with Nomsa
('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 month',
 'Financial review. Nomsa has strong numbers but needs better inventory management.', 'approved', NOW() - INTERVAL '1 month'),
('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 weeks',
 'Expansion planning. Helped with location analysis for new store.', 'approved', NOW() - INTERVAL '2 weeks'),

-- Sarah with Zanele
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '3 weeks',
 'Product development discussion. Zanele has innovative products but needs quality control.', 'approved', NOW() - INTERVAL '3 weeks'),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 week',
 'Stress test prep. Worked on financial projections.', 'not_approved', NOW() - INTERVAL '1 week');

-- =====================================================
-- 7. FUNDERS
-- =====================================================
INSERT INTO funders (funder_id, organization_name, investment_budget, preferred_industry, minimum_readiness_score, requirements_json) VALUES
('99999999-9999-9999-9999-999999999999', 'VCC Growth Fund', 5000000.00, 'Technology, Retail', 70,
 '{"documents": ["Business plan", "Financial statements", "Tax returns"], "stage": "Stage 2+", "location": "Gauteng"}'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Women Investment Network', 2500000.00, 'Women-owned businesses', 65,
 '{"documents": ["Business plan", "ID document", "Bank statements"], "stage": "Any stage", "location": "Nationwide", "womenOwned": "51%+"}'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'GreenTech Ventures', 10000000.00, 'Clean energy, Sustainability', 80,
 '{"documents": ["Environmental impact assessment", "Business plan", "Patents"], "stage": "Stage 3", "location": "Cape Town"}');

-- =====================================================
-- 8. FUNDER MATCHES
-- =====================================================
INSERT INTO funder_match (entrepreneur_id, funder_id, application_status, funder_feedback, created_at) VALUES
-- Thandi with VCC (approved)
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'approved',
 'Strong business model and financials. Schedule introductory call.', NOW() - INTERVAL '2 weeks'),

-- Thandi with WIN (pending)
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending',
 NULL, NOW() - INTERVAL '1 week'),

-- Nomsa with VCC (approved)
('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'approved',
 'Excellent retail track record. Ready for due diligence.', NOW() - INTERVAL '3 weeks'),

-- Nomsa with GreenTech (pending)
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending',
 NULL, NOW() - INTERVAL '2 days'),

-- Lebo with WIN (rejected)
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'rejected',
 'Business needs to complete grooming program first.', NOW() - INTERVAL '1 month'),

-- Zanele with WIN (pending)
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending',
 NULL, NOW() - INTERVAL '3 days');

-- =====================================================
-- 9. DOCUMENTS (for Vault)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID NOT NULL REFERENCES entrepreneurs(entrepreneur_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE
);

INSERT INTO documents (entrepreneur_id, document_type, file_path, file_name, uploaded_at, verified) VALUES
-- Thandi's documents
('11111111-1111-1111-1111-111111111111', 'idDocument', '/uploads/thandi-id.pdf', 'thandi_id_document.pdf', NOW() - INTERVAL '5 months', TRUE),
('11111111-1111-1111-1111-111111111111', 'businessRegistration', '/uploads/thandi-reg.pdf', 'thandi_registration.pdf', NOW() - INTERVAL '5 months', TRUE),
('11111111-1111-1111-1111-111111111111', 'taxClearance', '/uploads/thandi-tax.pdf', 'thandi_tax_clearance.pdf', NOW() - INTERVAL '4 months', TRUE),
('11111111-1111-1111-1111-111111111111', 'bankStatements', '/uploads/thandi-bank.pdf', 'thandi_bank_statements.pdf', NOW() - INTERVAL '4 months', TRUE),
('11111111-1111-1111-1111-111111111111', 'businessPlan', '/uploads/thandi-plan.pdf', 'thandi_business_plan.pdf', NOW() - INTERVAL '3 months', TRUE),

-- Lebo's documents
('22222222-2222-2222-2222-222222222222', 'idDocument', '/uploads/lebo-id.pdf', 'lebo_id_document.pdf', NOW() - INTERVAL '4 months', TRUE),
('22222222-2222-2222-2222-222222222222', 'businessRegistration', '/uploads/lebo-reg.pdf', 'lebo_registration.pdf', NOW() - INTERVAL '4 months', TRUE),
('22222222-2222-2222-2222-222222222222', 'bankStatements', '/uploads/lebo-bank.pdf', 'lebo_bank_statements.pdf', NOW() - INTERVAL '3 months', FALSE),

-- Nomsa's documents
('33333333-3333-3333-3333-333333333333', 'idDocument', '/uploads/nomsa-id.pdf', 'nomsa_id_document.pdf', NOW() - INTERVAL '3 months', TRUE),
('33333333-3333-3333-3333-333333333333', 'businessRegistration', '/uploads/nomsa-reg.pdf', 'nomsa_registration.pdf', NOW() - INTERVAL '3 months', TRUE),
('33333333-3333-3333-3333-333333333333', 'taxClearance', '/uploads/nomsa-tax.pdf', 'nomsa_tax_clearance.pdf', NOW() - INTERVAL '2 months', TRUE),
('33333333-3333-3333-3333-333333333333', 'businessPlan', '/uploads/nomsa-plan.pdf', 'nomsa_business_plan.pdf', NOW() - INTERVAL '1 month', TRUE),

-- Sipho's documents (minimal)
('44444444-4444-4444-4444-444444444444', 'idDocument', '/uploads/sipho-id.pdf', 'sipho_id_document.pdf', NOW() - INTERVAL '2 months', FALSE),

-- Zanele's documents
('55555555-5555-5555-5555-555555555555', 'idDocument', '/uploads/zanele-id.pdf', 'zanele_id_document.pdf', NOW() - INTERVAL '2 months', TRUE),
('55555555-5555-5555-5555-555555555555', 'businessRegistration', '/uploads/zanele-reg.pdf', 'zanele_registration.pdf', NOW() - INTERVAL '2 months', TRUE),
('55555555-5555-5555-5555-555555555555', 'businessPlan', '/uploads/zanele-plan.pdf', 'zanele_business_plan.pdf', NOW() - INTERVAL '1 month', FALSE);

-- =====================================================
-- 10. FUNDER LIKES (for matching system)
-- =====================================================
CREATE TABLE IF NOT EXISTS funder_likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrepreneur_id UUID REFERENCES entrepreneurs(entrepreneur_id) ON DELETE CASCADE,
    funder_id UUID REFERENCES funders(funder_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entrepreneur_id, funder_id)
);

INSERT INTO funder_likes (entrepreneur_id, funder_id, created_at) VALUES
-- Entrepreneurs liking funders
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '3 weeks'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 weeks'),
('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '1 month'),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '2 weeks'),
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 week'),

-- Funders liking entrepreneurs (creating mutual likes/matches)
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '2 weeks'), -- Mutual with VCC
('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '3 weeks'); -- Mutual with VCC

-- =====================================================
-- 11. NOTIFICATIONS (sample)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notifications (user_id, type, title, message, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'match', 'New Match!', 'You matched with VCC Growth Fund! Schedule an introductory call.', NOW() - INTERVAL '2 weeks'),
('11111111-1111-1111-1111-111111111111', 'mentor', 'Session Reminder', 'You have a session with Sarah tomorrow at 2 PM.', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'grooming', 'Grooming Progress', 'You''ve completed 2/6 modules. Keep going!', NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'match', 'Application Update', 'Your application to GreenTech Ventures is being reviewed.', NOW() - INTERVAL '2 days'),
('44444444-4444-4444-4444-444444444444', 'intake', 'Complete Your Profile', 'Please complete your intake form to get started.', NOW() - INTERVAL '1 week');

-- =====================================================
-- VIEWS FOR EASY REPORTING
-- =====================================================

-- Entrepreneur summary view
CREATE OR REPLACE VIEW entrepreneur_summary AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    e.business_name,
    e.industry,
    e.readiness_score,
    e.verified,
    e.compliance_completed,
    e.grooming_completed,
    e.stress_test_passed,
    (SELECT COUNT(*) FROM mentor_log WHERE entrepreneur_id = e.entrepreneur_id) as total_sessions,
    (SELECT COUNT(*) FROM mentor_log WHERE entrepreneur_id = e.entrepreneur_id AND vouch_status = 'approved') as total_vouches,
    (SELECT COUNT(*) FROM funder_match WHERE entrepreneur_id = e.entrepreneur_id) as total_applications,
    (SELECT COUNT(*) FROM funder_match WHERE entrepreneur_id = e.entrepreneur_id AND application_status = 'approved') as approved_matches
FROM entrepreneurs e
JOIN users u ON e.entrepreneur_id = u.user_id;

-- Mentor impact view
CREATE OR REPLACE VIEW mentor_impact AS
SELECT 
    u.user_id as mentor_id,
    u.full_name as mentor_name,
    COUNT(DISTINCT ml.entrepreneur_id) as entrepreneurs_mentored,
    COUNT(ml.log_id) as total_sessions,
    COUNT(CASE WHEN ml.vouch_status = 'approved' THEN 1 END) as vouches_given,
    COALESCE(AVG(e.readiness_score), 0) as avg_mentee_score
FROM users u
LEFT JOIN mentor_log ml ON u.user_id = ml.mentor_id
LEFT JOIN entrepreneurs e ON ml.entrepreneur_id = e.entrepreneur_id
WHERE u.role = 'mentor'
GROUP BY u.user_id, u.full_name;

-- Funder portfolio view
CREATE OR REPLACE VIEW funder_portfolio AS
SELECT 
    f.funder_id,
    f.organization_name,
    COUNT(DISTINCT fm.entrepreneur_id) as total_investments,
    COALESCE(SUM(e.fixed_cost + e.variable_monthly_cost), 0) as total_committed,
    COUNT(CASE WHEN fm.application_status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN fm.application_status = 'approved' THEN 1 END) as active_investments
FROM funders f
LEFT JOIN funder_match fm ON f.funder_id = fm.funder_id
LEFT JOIN entrepreneurs e ON fm.entrepreneur_id = e.entrepreneur_id
GROUP BY f.funder_id, f.organization_name;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
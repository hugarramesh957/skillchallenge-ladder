import assert from 'node:assert';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';
import { seedDatabase } from '../seed/seed.js';
import {
  isChallengeUnlocked,
  getChallengeStatusForStudent,
  getCompletedChallengeIds,
  checkCircularPrerequisites,
} from '../services/unlockService.js';
import { getPersonalizedRecommendation } from '../services/recommendationService.js';

dotenv.config();

const runAllTests = async () => {
  console.log('=====================================================');
  console.log('  SkillChallenge Ladder - Comprehensive Test Suite  ');
  console.log('=====================================================\n');

  try {
    // 1. Connect & Seed
    console.log('[Test 1] Initializing database and running seed...');
    await seedDatabase();

    const reviewer = await User.findOne({ email: 'reviewer@skillladder.com' });
    const student = await User.findOne({ email: 'student@skillladder.com' });

    assert.ok(reviewer, 'Reviewer demo account should exist');
    assert.ok(student, 'Student demo account should exist');
    assert.strictEqual(reviewer.role, 'reviewer', 'Reviewer role must be reviewer');
    assert.strictEqual(student.role, 'student', 'Student role must be student');
    console.log('  ✓ Reviewer and Student accounts verified.\n');

    // 2. Authentication Password Hashing & Verification
    console.log('[Test 2] Testing Password Hashing & Authentication...');
    const userWithPassword = await User.findOne({ email: 'student@skillladder.com' }).select('+password');
    const validMatch = await userWithPassword.comparePassword('Student@123');
    const invalidMatch = await userWithPassword.comparePassword('WrongPassword@999');

    assert.strictEqual(validMatch, true, 'Correct password must match hash');
    assert.strictEqual(invalidMatch, false, 'Incorrect password must be rejected');
    console.log('  ✓ Bcrypt password verification working properly.\n');

    // 3. Challenge Tree Verification
    console.log('[Test 3] Verifying 12-Challenge Progressive Tree...');
    const allChallenges = await Challenge.find({});
    assert.strictEqual(allChallenges.length, 12, 'Must have exactly 12 seeded challenges');

    const c1 = await Challenge.findOne({ slug: 'create-a-personal-html-profile-page' });
    const c2 = await Challenge.findOne({ slug: 'build-a-responsive-landing-page' });
    const c3 = await Challenge.findOne({ slug: 'develop-a-personal-portfolio-website' });
    const c12 = await Challenge.findOne({ slug: 'create-a-full-stack-project-management-platform' });

    assert.ok(c1 && c2 && c3 && c12, 'Key challenges must exist');
    assert.strictEqual(c1.prerequisites.length, 0, 'Challenge 1 must have no prerequisites');
    assert.strictEqual(c2.prerequisites.length, 1, 'Challenge 2 must require Challenge 1');
    assert.strictEqual(c2.prerequisites[0].toString(), c1._id.toString(), 'C2 prereq must be C1');
    assert.strictEqual(c12.prerequisites.length, 2, 'Challenge 12 requires multiple prerequisites');
    console.log('  ✓ Prerequisite dependency tree correctly configured.\n');

    // 4. Circular Prerequisite Prevention
    console.log('[Test 4] Testing Circular Prerequisite Detection...');
    const isSelfCircular = await checkCircularPrerequisites(c1._id, [c1._id]);
    assert.strictEqual(isSelfCircular, true, 'Self-referencing prerequisite must be detected');

    const isDeepCircular = await checkCircularPrerequisites(c1._id, [c2._id]); // C2 depends on C1
    assert.strictEqual(isDeepCircular, true, 'Deep circular cycle must be detected');

    const isNonCircular = await checkCircularPrerequisites(c3._id, [c2._id]);
    assert.strictEqual(isNonCircular, false, 'Valid linear prerequisite must not be flagged');
    console.log('  ✓ Circular dependency guard functioning accurately.\n');

    // 5. Smart Unlocking Verification for Demo Student
    console.log('[Test 5] Testing Smart Unlocking for Demo Student...');
    // Seed has C1 approved for student, C2 in-progress
    const c1Status = await getChallengeStatusForStudent(student._id, c1._id);
    const c2Status = await getChallengeStatusForStudent(student._id, c2._id);
    const c3Status = await getChallengeStatusForStudent(student._id, c3._id);
    const c4Status = await getChallengeStatusForStudent(student._id, (await Challenge.findOne({ slug: 'create-an-interactive-calculator' }))._id);

    assert.strictEqual(c1Status, 'completed', 'Challenge 1 must be completed (approved submission)');
    assert.strictEqual(c2Status, 'in_progress', 'Challenge 2 must be in_progress');
    assert.strictEqual(c3Status, 'locked', 'Challenge 3 must be locked because C2 is not yet approved');
    assert.strictEqual(c4Status, 'locked', 'Challenge 4 must be locked');

    const isC2Unlocked = await isChallengeUnlocked(student._id, c2._id);
    const isC3Unlocked = await isChallengeUnlocked(student._id, c3._id);

    assert.strictEqual(isC2Unlocked, true, 'Challenge 2 must be unlocked');
    assert.strictEqual(isC3Unlocked, false, 'Challenge 3 must be locked');
    console.log('  ✓ Challenge 1 is Completed, Challenge 2 is Unlocked, Challenge 3 remains Locked.\n');

    // 6. Complete End-to-End Progression Flow
    console.log('[Test 6] Running End-to-End Simulation: Submit C2 -> Reviewer Rejection -> Revision -> Reviewer Approval -> C3 Unlocks...');
    
    // Step A: Student submits C2
    const attempt1 = await Submission.create({
      studentId: student._id,
      challengeId: c2._id,
      attemptNumber: 1,
      description: 'First draft of responsive landing page',
      approach: 'Built flexbox hero section and initial grid',
      status: 'pending',
    });

    const c2PendingStatus = await getChallengeStatusForStudent(student._id, c2._id);
    assert.strictEqual(c2PendingStatus, 'submitted', 'Status must transition to submitted while pending review');
    console.log('  ✓ Student submitted attempt #1. Status is "submitted".');

    // Step B: Reviewer requests revision
    attempt1.status = 'needs_revision';
    attempt1.score = 65;
    attempt1.reviewerFeedback = 'Mobile viewport collapses unexpectedly. Please fix the media query breakpoints and test on 375px.';
    attempt1.improvementAreas = 'Media queries, responsive grid breakpoints';
    attempt1.recommendedFocusTags = ['CSS3', 'Responsive Design', 'Flexbox'];
    attempt1.reviewedBy = reviewer._id;
    attempt1.reviewedAt = new Date();
    await attempt1.save();

    const c2RevisionStatus = await getChallengeStatusForStudent(student._id, c2._id);
    assert.strictEqual(c2RevisionStatus, 'needs_revision', 'Status must transition to needs_revision');
    const isC3StillLocked = await isChallengeUnlocked(student._id, c3._id);
    assert.strictEqual(isC3StillLocked, false, 'C3 must remain LOCKED when C2 needs revision');
    console.log('  ✓ Reviewer requested improvement. Challenge 2 is "needs_revision" and Challenge 3 is STILL LOCKED.');

    // Step C: Student submits Attempt #2
    const attempt2 = await Submission.create({
      studentId: student._id,
      challengeId: c2._id,
      attemptNumber: 2,
      description: 'Revised responsive landing page with fixed media queries and responsive auto-fit grid',
      approach: 'Refactored to mobile-first layout. Tested at 320px, 375px, and 1440px.',
      status: 'pending',
    });

    // Step D: Reviewer approves Attempt #2
    attempt2.status = 'approved';
    attempt2.score = 92;
    attempt2.reviewerFeedback = 'Superb correction! The mobile drawer and responsive grid work seamlessly without any horizontal overflow.';
    attempt2.strengths = 'Flawless mobile layout, clean CSS organization';
    attempt2.recommendedFocusTags = ['JavaScript', 'DOM Manipulation', 'localStorage'];
    attempt2.reviewedBy = reviewer._id;
    attempt2.reviewedAt = new Date();
    await attempt2.save();

    const c2ApprovedStatus = await getChallengeStatusForStudent(student._id, c2._id);
    assert.strictEqual(c2ApprovedStatus, 'completed', 'Challenge 2 must now be completed');

    // Step E: Verify Challenge 3 automatically UNLOCKED!
    const isC3NowUnlocked = await isChallengeUnlocked(student._id, c3._id);
    assert.strictEqual(isC3NowUnlocked, true, 'Challenge 3 must now be AUTOMATICALLY UNLOCKED!');
    const c3NewStatus = await getChallengeStatusForStudent(student._id, c3._id);
    assert.strictEqual(c3NewStatus, 'available', 'Challenge 3 status must now be "available"');
    console.log('  ✓ Reviewer APPROVED attempt #2! Challenge 2 is "completed".');
    console.log('  ✓ Smart Challenge Unlocking verified: Challenge 3 is now AUTOMATICALLY UNLOCKED ("available")!\n');

    // 7. Personalized Recommendation Engine
    console.log('[Test 7] Testing Personalized Recommendation Engine...');
    const recResult = await getPersonalizedRecommendation(student._id);
    assert.ok(recResult.recommendation, 'Recommendation engine must return a challenge');
    assert.strictEqual(recResult.recommendation._id.toString(), c3._id.toString(), 'Next recommendation must be Challenge 3');
    assert.ok(recResult.reason.length > 10, 'Recommendation must include clear contextual explanation');
    console.log(`  ✓ Recommendation generated: "${recResult.recommendation.title}"`);
    console.log(`  ✓ Explanation: "${recResult.reason}"\n`);

    // 8. Multiple Prerequisites Test
    console.log('[Test 8] Testing Multi-Prerequisite Challenge Unlocking (Challenge 12 requires C11 & C8)...');
    const isC12UnlockedEarly = await isChallengeUnlocked(student._id, c12._id);
    assert.strictEqual(isC12UnlockedEarly, false, 'Challenge 12 must be locked when neither C11 nor C8 are completed');
    console.log('  ✓ Multi-prerequisite challenge stays strictly locked until ALL dependencies are approved.\n');

    console.log('=====================================================');
    console.log('  ALL 8 CORE SYSTEM TESTS PASSED SUCCESSFULLY! (100%) ');
    console.log('=====================================================\n');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('Test Suite Failed:', err);
    await closeDB();
    process.exit(1);
  }
};

runAllTests();


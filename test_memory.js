
import { createMemory, readMemory, updateMemory, searchMemory, deleteMemory, listMemories, getMemoriesForCompression, archiveMemories } from './memory_manager.js';
import assert from 'assert';
import fs from 'fs';

async function runTests() {
    console.log("Starting tests...");

    // Cleanup previous runs
    console.log("Cleaning up...");
    try {
        await deleteMemory("test_memory.md");
    } catch (e) {}
    try {
         await deleteMemory("test_goal.md");
    } catch (e) {}
     try {
         await deleteMemory("test_mid_term.md");
    } catch (e) {}

    // 1. Create Short Term Memory
    console.log("Test 1: Create Short Term Memory");
    await createMemory("This is a short term memory.", { title: "Test Memory", tier: "short_term" });
    const mem1 = await readMemory("test_memory.md", "short_term");
    assert.strictEqual(mem1.title, "Test Memory");
    assert.strictEqual(mem1.tier, "short_term");
    console.log("Passed.");

    // 2. Create Protected Goal
    console.log("Test 2: Create Goal (Protected)");
    await createMemory("I want to learn everything.", { title: "Test Goal", type: "goal" });
    const goal = await readMemory("test_goal.md");
    assert.strictEqual(goal.protected, true);
    console.log("Passed.");

    // 3. Update Memory (Move to Mid Term)
    console.log("Test 3: Update Memory (Move to Mid Term)");
    await updateMemory("test_memory.md", "Updated content", { tier: "mid_term" });
    const mem2 = await readMemory("test_memory.md");
    assert.strictEqual(mem2.tier, "mid_term");
    assert.strictEqual(mem2.content.trim(), "Updated content");
    
    // Check if it's gone from short_term
    try {
        await readMemory("test_memory.md", "short_term");
        assert.fail("Should not find memory in short_term");
    } catch (e) {
        assert.ok(e.message.includes("File not found"));
    }
    console.log("Passed.");

    // 4. Search
    console.log("Test 4: Search");
    const results = await searchMemory("updated");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].title, "Test Memory");
    console.log("Passed.");

    // 5. Compression Logic (Short Term)
    console.log("Test 5: Compression Logic (Short Term)");
    // Create another short term memory
    await createMemory("Another short term memory.", { title: "Short 2", tier: "short_term" });
    
    const compressionData = await getMemoriesForCompression("short_term");
    // Should include "Short 2" but NOT "Test Goal" (even if goal was short term, but goal defaulting to short term unless specified? Yes. Wait, creates goal in short term by default)
    // Actually, createMemory defaults to short_term. 
    // Let's check where Test Goal is.
    const goalCheck = await readMemory("test_goal.md");
    assert.strictEqual(goalCheck.tier, "short_term"); // Default

    // So getMemoriesForCompression("short_term") should return "Short 2" but exclude "Test Goal" because it's type: goal.
    assert.ok(compressionData.files.includes("short_2.md"));
    assert.ok(!compressionData.files.includes("test_goal.md"));
    console.log("Passed.");

    // 6. Archive
    console.log("Test 6: Archive");
    await archiveMemories(["short_2.md"]);
    const archived = await readMemory("short_2.md");
    assert.strictEqual(archived.tier, "archive");
    console.log("Passed.");

    // 7. Cleanup
    console.log("Cleanup...");
    await deleteMemory("test_memory.md");
    await deleteMemory("test_goal.md");
    await deleteMemory("short_2.md");
    console.log("Tests Completed Successfully.");
}

runTests().catch(console.error);

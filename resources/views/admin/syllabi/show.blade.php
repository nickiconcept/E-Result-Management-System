@extends('layouts.admin')

@section('title', 'Syllabus Details')
@section('header', 'View Syllabus')

@section('content')
<div class="mb-6">
    <a href="{{ route('syllabi.index') }}" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Syllabi List
    </a>
</div>

<div class="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mb-6">
    <div class="p-6 sm:p-8">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {{ $syllabus->schoolClass->name }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {{ $syllabus->term }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-150">
                {{ $syllabus->subject->name }}
            </span>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $syllabus->title }}</h1>
        <p class="text-xs text-gray-400 mb-6">Created by <span class="font-semibold text-gray-600">{{ $syllabus->creator->name ?? 'Administrator' }}</span> on {{ $syllabus->created_at->format('F d, Y at h:i A') }}</p>

        <div class="border-t border-gray-100 pt-6">
            <h3 class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Syllabus Outline & Content</h3>
            <div class="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                @if($syllabus->content)
                    {!! nl2br(e($syllabus->content)) !!}
                @else
                    <p class="italic text-gray-400">No descriptive text provided for this syllabus.</p>
                @endif
            </div>
        </div>

        @if($syllabus->file_path)
            <div class="border-t border-gray-100 mt-8 pt-6">
                <h3 class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Attached Document</h3>
                <div class="flex items-center p-4 rounded-lg bg-emerald-50/50 border border-emerald-100/50 max-w-md">
                    <svg class="w-8 h-8 text-primary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">Curriculum Attachment</p>
                        <p class="text-xs text-gray-400">Uploaded on {{ $syllabus->updated_at->format('M d, Y') }}</p>
                    </div>
                    <a href="{{ asset('storage/' . $syllabus->file_path) }}" target="_blank" class="ml-4 inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-primary hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-xs">
                        Download File
                    </a>
                </div>
            </div>
        @endif
    </div>

    @if(Auth::user()->role === 'admin')
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button onclick="document.getElementById('editSyllabusModal').classList.remove('hidden')" class="bg-white hover:bg-gray-150 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-xs">
                Edit Syllabus
            </button>
            <form action="{{ route('syllabi.destroy', $syllabus) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this syllabus?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-xs">
                    Delete Syllabus
                </button>
            </form>
        </div>
        
        <!-- Reuse Edit Modal inside detail page -->
        <div id="editSyllabusModal" class="hidden fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick="document.getElementById('editSyllabusModal').classList.add('hidden')"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                    <form action="{{ route('syllabi.update', $syllabus) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')
                        <div class="bg-white px-6 pt-6 pb-4 sm:p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-emerald-500 pb-2">Edit Syllabus</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Class *</label>
                                    <select name="school_class_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Class</option>
                                        @foreach(\App\Models\SchoolClass::orderBy('name')->get() as $c)
                                            <option value="{{ $c->id }}" {{ $syllabus->school_class_id == $c->id ? 'selected' : '' }}>{{ $c->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Subject *</label>
                                    <select name="subject_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Subject</option>
                                        @foreach(\App\Models\Subject::orderBy('name')->get() as $s)
                                            <option value="{{ $s->id }}" {{ $syllabus->subject_id == $s->id ? 'selected' : '' }}>{{ $s->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Term *</label>
                                    <select name="term" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Term</option>
                                        <option value="First Term" {{ $syllabus->term === 'First Term' ? 'selected' : '' }}>First Term</option>
                                        <option value="Second Term" {{ $syllabus->term === 'Second Term' ? 'selected' : '' }}>Second Term</option>
                                        <option value="Third Term" {{ $syllabus->term === 'Third Term' ? 'selected' : '' }}>Third Term</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Syllabus Title *</label>
                                    <input type="text" name="title" value="{{ $syllabus->title }}" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Content / Description</label>
                                    <textarea name="content" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">{{ $syllabus->content }}</textarea>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-700">Update Syllabus File (Optional - Max 10MB)</label>
                                    <input type="file" name="file" accept=".pdf,.doc,.docx,image/*" class="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
                            <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-primary text-sm font-semibold text-white hover:bg-emerald-600 sm:ml-3 sm:w-auto shadow-sm">
                                Save Changes
                            </button>
                            <button type="button" onclick="document.getElementById('editSyllabusModal').classList.add('hidden')" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto shadow-xs">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif
</div>
@endsection

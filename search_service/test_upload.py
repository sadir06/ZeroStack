#!/usr/bin/env python3
"""
Test script for the upload functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_upload_csv():
    """Test uploading CSV data"""
    print("Testing CSV upload...")
    
    csv_data = """name,age,city
John,25,New York
Jane,30,Los Angeles
Bob,35,Chicago
Alice,28,Boston"""
    
    files = {'file': ('test.csv', csv_data, 'text/csv')}
    data = {'dataset_name': 'Test CSV Dataset'}
    
    response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ CSV upload successful!")
        print(f"   Dataset ID: {result['dataset_id']}")
        print(f"   Records: {result['total_records']}")
        print(f"   Format detected: {result['format_detected']['type']}")
        return result['dataset_id']
    else:
        print(f"❌ CSV upload failed: {response.text}")
        return None

def test_upload_json():
    """Test uploading JSON data"""
    print("\nTesting JSON upload...")
    
    json_data = json.dumps([
        {"title": "AI Article 1", "content": "This is about artificial intelligence", "tags": "ai,ml"},
        {"title": "ML Article 2", "content": "Machine learning basics", "tags": "ml,data"},
        {"title": "Data Science", "content": "Introduction to data science", "tags": "data,analytics"}
    ])
    
    data = {
        'dataset_name': 'Test JSON Dataset',
        'text_data': json_data
    }
    
    response = requests.post(f"{BASE_URL}/upload", data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ JSON upload successful!")
        print(f"   Dataset ID: {result['dataset_id']}")
        print(f"   Records: {result['total_records']}")
        print(f"   Format detected: {result['format_detected']['type']}")
        return result['dataset_id']
    else:
        print(f"❌ JSON upload failed: {response.text}")
        return None

def test_upload_unstructured():
    """Test uploading unstructured text"""
    print("\nTesting unstructured text upload...")
    
    text_data = """
    This is a paragraph about artificial intelligence and machine learning.
    AI has become increasingly important in modern technology.
    
    Machine learning algorithms can process large amounts of data.
    Deep learning is a subset of machine learning.
    
    Natural language processing helps computers understand human language.
    Computer vision enables machines to interpret visual information.
    """
    
    data = {
        'dataset_name': 'Test Unstructured Dataset',
        'text_data': text_data
    }
    
    response = requests.post(f"{BASE_URL}/upload", data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Unstructured text upload successful!")
        print(f"   Dataset ID: {result['dataset_id']}")
        print(f"   Records: {result['total_records']}")
        print(f"   Format detected: {result['format_detected']['type']}")
        return result['dataset_id']
    else:
        print(f"❌ Unstructured text upload failed: {response.text}")
        return None

def test_search_in_dataset(dataset_id):
    """Test searching in the uploaded dataset"""
    print(f"\nTesting search in dataset {dataset_id}...")
    
    search_data = {
        'query': 'artificial intelligence',
        'top_k': 5,
        'dataset_id': dataset_id
    }
    
    response = requests.post(f"{BASE_URL}/search", json=search_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Search successful!")
        print(f"   Found {result['total_found']} results")
        print(f"   Query: {result['query']}")
        return True
    else:
        print(f"❌ Search failed: {response.text}")
        return False

def test_list_datasets():
    """Test listing all datasets"""
    print("\nTesting dataset listing...")
    
    response = requests.get(f"{BASE_URL}/datasets")
    
    if response.status_code == 200:
        datasets = response.json()
        print(f"✅ Found {len(datasets)} datasets:")
        for dataset in datasets:
            print(f"   - {dataset['name']} (ID: {dataset['id']}, Records: {dataset['total_records']})")
        return True
    else:
        print(f"❌ Failed to list datasets: {response.text}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting upload functionality tests...\n")
    
    # Test uploads
    csv_dataset_id = test_upload_csv()
    json_dataset_id = test_upload_json()
    unstructured_dataset_id = test_upload_unstructured()
    
    # Test listing datasets
    test_list_datasets()
    
    # Test search in uploaded datasets
    if csv_dataset_id:
        test_search_in_dataset(csv_dataset_id)
    if json_dataset_id:
        test_search_in_dataset(json_dataset_id)
    if unstructured_dataset_id:
        test_search_in_dataset(unstructured_dataset_id)
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main() 